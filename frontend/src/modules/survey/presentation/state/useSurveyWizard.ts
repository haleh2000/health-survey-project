import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toAsciiDigits } from "@core/text/digits";
import type { AppError } from "@core/errors/app-error";

import type { ChoiceQuestion, Question, QuestionId } from "@survey/domain/entities/question.entity";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { NationalId } from "@survey/domain/value-objects/national-id.vo";
import {
  readList,
  readText,
  type SurveyAnswers,
} from "@survey/domain/entities/survey-answers.entity";
import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import type { FieldErrors } from "@survey/domain/services/answer-validation.service";
import { setAnswer, toggleAnswer } from "@survey/domain/services/answer-update.service";
import { visibleQuestionsOf } from "@survey/domain/services/question-visibility.service";
import { BACKEND_VALUE } from "@survey/infrastructure/contract/backend-contract";
import {
  normalizeNationalId,
  resolveLatestAssessmentForUser,
  saveAssessmentRecord,
} from "@survey/infrastructure/storage/assessment-history.storage";
import { questionAnchorId } from "@survey/presentation/components/question-anchor";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { useAuth } from "../../../../auth/useAuth";

/**
 * Unfinished answers only. A calculated result is not restored as a filled
 * form: opening the survey shows that result until «ارزیابی مجدد» starts
 * a blank questionnaire. Older saves have no revision and are dropped once.
 */
const STORAGE_KEY = "health-survey-progress";
const DRAFT_REVISION = 2;

type StoredDraft = {
  revision: number;
  status: "draft";
  answers: SurveyAnswers;
  stepIndex: number;
};

const readDraft = (): { answers: SurveyAnswers; stepIndex: number } | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved) as Partial<StoredDraft>;
    const stepIndex = data.stepIndex;
    const savedAnswers = data.answers;
    if (
      data.revision !== DRAFT_REVISION ||
      data.status !== "draft" ||
      typeof stepIndex !== "number" ||
      !Number.isInteger(stepIndex) ||
      stepIndex < 0 ||
      !savedAnswers ||
      typeof savedAnswers !== "object" ||
      Array.isArray(savedAnswers)
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return { answers: savedAnswers, stepIndex };
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore a store that can no longer be cleared.
    }
    return null;
  }
};

const writeDraft = (answers: SurveyAnswers, stepIndex: number): void => {
  const draft: StoredDraft = {
    revision: DRAFT_REVISION,
    status: "draft",
    answers,
    stepIndex,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

const clearDraft = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export type WizardStage = "filling" | "submitting" | "completed";

export interface SurveyWizard {
  readonly stage: WizardStage;
  readonly step: SurveyStep;
  readonly stepIndex: number;
  readonly stepCount: number;
  readonly isLastStep: boolean;
  readonly questions: readonly Question[];
  readonly answers: SurveyAnswers;
  readonly errors: FieldErrors;
  readonly remoteError: AppError | null;
  readonly assessment: RiskAssessment | null;
  readonly answeredCount: number;
  readonly totalCount: number;
  readonly readOnlyIds: ReadonlySet<QuestionId>;

  valueOf: (id: QuestionId) => string;
  selectionOf: (id: QuestionId) => readonly string[];
  setValue: (question: Question, value: string) => void;
  toggleValue: (question: ChoiceQuestion, value: string) => void;
  goNext: () => void;
  goBack: () => void;
  restart: () => void;
  /** Returns to the latest saved result and drops the in-progress form. */
  restoreLatestResult: () => boolean;
  readonly hasSavedResult: boolean;
}

/** Brings the first invalid answer into view instead of leaving the user hunting. */
const focusFirstError = (errors: FieldErrors): void => {
  const [firstId] = Object.keys(errors) as QuestionId[];
  if (!firstId) return;

  requestAnimationFrame(() => {
    document
      .getElementById(questionAnchorId(firstId))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
};

const scrollToTop = (): void => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
};

/**
 * All wizard state, in one hook.
 *
 * It holds *only* state and sequencing — which step is showing, what has been
 * typed, what failed. Every rule it applies (is this answer valid, does this
 * question show, what does "هیچکدام" clear) is delegated to the domain
 * services through the use cases, so the same behaviour is testable without
 * rendering a component.
 */
type WizardBoot = {
  answers: SurveyAnswers;
  stepIndex: number;
  stage: WizardStage;
  assessment: RiskAssessment | null;
};

const bootWizard = (preferResult: boolean, nationalId: string): WizardBoot => {
  if (preferResult) {
    const record = resolveLatestAssessmentForUser(nationalId);
    if (record) {
      return {
        answers: {
          ...(record.nationalId ? { national_id: record.nationalId } : {}),
        } as SurveyAnswers,
        stepIndex: 0,
        stage: "completed",
        assessment: record.assessment,
      };
    }
  }

  const draft = readDraft();
  if (!draft) {
    return { answers: {}, stepIndex: 0, stage: "filling", assessment: null };
  }

  return {
    answers: draft.answers,
    stepIndex: draft.stepIndex,
    stage: "filling",
    assessment: null,
  };
};

export function useSurveyWizard(options?: { readonly preferResult?: boolean }): SurveyWizard {
  const preferResult = options?.preferResult ?? true;
  const { definition, validateStep, submitSurvey, progress } = useSurveyDependencies();
  const { user } = useAuth();

  // Name and national id come from the Didar session, not from what the user
  // types, so any saved draft is overridden with the authenticated identity.
  // Lookup uses the raw session value; only a valid national code is written
  // into the form field (a mobile number or anything else is dropped there).
  const lookupNationalId = user?.national_id
    ? normalizeNationalId(user.national_id)
    : "";
  const sessionNationalId =
    lookupNationalId && NationalId.isValid(lookupNationalId)
      ? lookupNationalId
      : "";

  const applySessionIdentity = useCallback(
    (base: SurveyAnswers): SurveyAnswers => {
      const { national_id: draftNationalId, ...rest } = base as Record<string, unknown>;
      const cleaned = {
        ...rest,
        ...(typeof draftNationalId === "string" && NationalId.isValid(draftNationalId)
          ? { national_id: draftNationalId }
          : {}),
      } as SurveyAnswers;
      if (!user) return cleaned;
      return {
        ...cleaned,
        ...(user.full_name ? { full_name: user.full_name } : {}),
        ...(sessionNationalId ? { national_id: sessionNationalId } : {}),
      };
    },
    [user, sessionNationalId],
  );

  const [boot] = useState(() => bootWizard(preferResult, lookupNationalId));

  const [answers, setAnswers] = useState<SurveyAnswers>(() => applySessionIdentity(boot.answers));

  const readOnlyIds = useMemo<ReadonlySet<QuestionId>>(() => {
    const ids = new Set<QuestionId>();
    if (user?.full_name) ids.add("full_name" as QuestionId);
    if (sessionNationalId) ids.add("national_id" as QuestionId);
    return ids;
  }, [user, sessionNationalId]);

  const [stepIndex, setStepIndex] = useState<number>(boot.stepIndex);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [stage, setStage] = useState<WizardStage>(boot.stage);
  const [remoteError, setRemoteError] = useState<AppError | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(boot.assessment);
  const lastAnsweredQuestionRef = useRef<QuestionId | null>(null);

  useEffect(() => {
    // A finished assessment must not be restored as a filled form.
    if (stage === "completed") {
      clearDraft();
      return;
    }

    try {
      writeDraft(answers, stepIndex);
    } catch {
      // A full or blocked store must not stop the questionnaire itself.
    }
  }, [answers, stepIndex, stage]);

  const step = definition.stepAt(stepIndex) ?? definition.steps[0];
  if (!step) throw new Error("The survey definition contains no steps.");

  const questions = useMemo(
    () => visibleQuestionsOf(definition, step, answers),
    [definition, step, answers],
  );

  const { answered, total } = useMemo(
    () => progress.execute(answers),
    [progress, answers],
  );

  /** Clearing the error as the user edits avoids nagging mid-correction. */
  const clearError = useCallback((id: QuestionId) => {
    setErrors((previous) => {
      if (!(id in previous)) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const setValue = useCallback(
    (question: Question, value: string) => {
      setAnswers((previous) => setAnswer(previous, question, value));
      clearError(question.id);
      lastAnsweredQuestionRef.current = question.id;
    },
    [clearError],
  );

  const toggleValue = useCallback(
    (question: ChoiceQuestion, value: string) => {
      setAnswers((previous) => toggleAnswer(previous, question, value));
      clearError(question.id);
      lastAnsweredQuestionRef.current = question.id;
    },
    [clearError],
  );

  /** Moves to the step that owns the first failing answer, then scrolls to it. */
  const jumpToFirstError = useCallback(
    (fieldErrors: FieldErrors) => {
      const [firstId] = Object.keys(fieldErrors) as QuestionId[];
      if (firstId) {
        const owner = definition.stepIndexOf(firstId);
        if (owner >= 0) setStepIndex(owner);
      }
      focusFirstError(fieldErrors);
    },
    [definition],
  );

  const submit = useCallback(
    async (finalAnswers: SurveyAnswers) => {
      setStage("submitting");
      setRemoteError(null);

      const result = await submitSurvey.execute(finalAnswers);

      if (result.ok) {
        // قد و وزن هم ذخیره می‌شوند تا داشبورد بتواند BMI را به کیلوگرم ترجمه کند.
        const metrics = BodyMetrics.create(
          Number(toAsciiDigits(readText(finalAnswers, "height" as QuestionId))),
          Number(toAsciiDigits(readText(finalAnswers, "weight" as QuestionId))),
        );
        // جنسیت هم ذخیره می‌شود تا پیکرهٔ بدن در داشبورد و گزارش، همان کاربر را نشان دهد.
        const gender = readText(finalAnswers, "gender" as QuestionId).trim();
        const sex =
          gender === BACKEND_VALUE.gender.female
            ? "female"
            : gender === BACKEND_VALUE.gender.male
              ? "male"
              : null;


            const nationalId =
              lookupNationalId ||
              normalizeNationalId(
                readText(finalAnswers, "national_id" as QuestionId),
              );

            saveAssessmentRecord(
              result.value,

              metrics
                ? {
                    heightCm:
                      metrics.heightCm,
                    weightKg:
                      metrics.weightKg,
                  }
                : null,

              sex,

              nationalId,
            );

        clearDraft();
        setAssessment(result.value);
        setStage("completed");
        scrollToTop();
        return;
      }

      setStage("filling");

      if (result.error.kind === "remote") {
        // Field-level detail can still arrive from a backend 422 — surface it
        // on the offending question rather than only as a banner.
        const fieldErrors = result.error.error.fieldErrors;
        if (fieldErrors) {
          const mapped = fieldErrors as FieldErrors;
          setErrors(mapped);
          jumpToFirstError(mapped);
          return;
        }

        setRemoteError(result.error.error);
        scrollToTop();
        return;
      }

      setErrors(result.error.fieldErrors);
      jumpToFirstError(result.error.fieldErrors);
    },
    [submitSurvey, jumpToFirstError, lookupNationalId],
  );

  /** Auto-scroll / auto-advance after the user answers a question. */
  useEffect(() => {
    const answeredId = lastAnsweredQuestionRef.current;
    if (!answeredId) return;
    lastAnsweredQuestionRef.current = null;

    const currentIndex = questions.findIndex((q) => q.id === answeredId);
    if (currentIndex < 0) return;

    if (currentIndex === questions.length - 1) {
      const validation = validateStep.execute(stepIndex, answers);
      if (!validation.canAdvance) return;

      if (stepIndex >= definition.stepCount - 1) {
        void submit(answers);
      } else {
        setStepIndex((current) => current + 1);
        scrollToTop();
      }
    } else {
      const nextQuestion = questions[currentIndex + 1];
      if (nextQuestion) {
        requestAnimationFrame(() => {
          document
            .getElementById(questionAnchorId(nextQuestion.id))
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
  }, [answers, stepIndex, questions, definition, submit, validateStep]);

  const goNext = useCallback(() => {
    const validation = validateStep.execute(stepIndex, answers);
    setErrors(validation.errors);

    if (!validation.canAdvance) {
      focusFirstError(validation.errors);
      return;
    }

    if (stepIndex >= definition.stepCount - 1) {
      void submit(answers);
      return;
    }

    setStepIndex((current) => current + 1);
    scrollToTop();
  }, [validateStep, stepIndex, answers, definition, submit]);

  const goBack = useCallback(() => {
    setRemoteError(null);
    setStepIndex((current) => Math.max(0, current - 1));
    scrollToTop();
  }, []);

  const restart = useCallback(() => {
    clearDraft();
    setAnswers(applySessionIdentity({}));
    setErrors({});
    setStepIndex(0);
    setAssessment(null);
    setRemoteError(null);
    setStage("filling");
    scrollToTop();
  }, [applySessionIdentity]);

  const restoreLatestResult = useCallback(() => {
    const record = resolveLatestAssessmentForUser(lookupNationalId);
    if (!record) return false;

    clearDraft();
    setAnswers(
      applySessionIdentity(
        (record.nationalId
          ? { national_id: record.nationalId }
          : {}) as SurveyAnswers,
      ),
    );
    setErrors({});
    setStepIndex(0);
    setRemoteError(null);
    setAssessment(record.assessment);
    setStage("completed");
    scrollToTop();
    return true;
  }, [applySessionIdentity, lookupNationalId]);

  const hasSavedResult = useMemo(
    () => resolveLatestAssessmentForUser(lookupNationalId) !== null,
    [lookupNationalId, stage],
  );

  return {
    stage,
    step,
    stepIndex,
    stepCount: definition.stepCount,
    isLastStep: stepIndex === definition.stepCount - 1,
    questions,
    answers,
    errors,
    remoteError,
    assessment,
    answeredCount: answered,
    totalCount: total,
    readOnlyIds,

    valueOf: (id) => readText(answers, id),
    selectionOf: (id) => readList(answers, id),
    setValue,
    toggleValue,
    goNext,
    goBack,
    restart,
    restoreLatestResult,
    hasSavedResult,
  };
}
