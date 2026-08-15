import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppError } from "@core/errors/app-error";

import type { ChoiceQuestion, Question, QuestionId } from "@survey/domain/entities/question.entity";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import {
  readList,
  readText,
  type SurveyAnswers,
} from "@survey/domain/entities/survey-answers.entity";
import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import type { FieldErrors } from "@survey/domain/services/answer-validation.service";
import { setAnswer, toggleAnswer } from "@survey/domain/services/answer-update.service";
import { visibleQuestionsOf } from "@survey/domain/services/question-visibility.service";
import { saveAssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import { questionAnchorId } from "@survey/presentation/components/question-anchor";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";

// const STORAGE_KEY = "health-survey-progress";

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

  valueOf: (id: QuestionId) => string;
  selectionOf: (id: QuestionId) => readonly string[];
  setValue: (question: Question, value: string) => void;
  toggleValue: (question: ChoiceQuestion, value: string) => void;
  goNext: () => void;
  goBack: () => void;
  restart: () => void;
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
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
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
export function useSurveyWizard(): SurveyWizard {
  const { definition, validateStep, submitSurvey, progress } = useSurveyDependencies();

  const STORAGE_KEY = "health-survey-progress";

  const [answers, setAnswers] = useState<SurveyAnswers>(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return {};

  const data = JSON.parse(saved);

  return data.answers ?? {};
});


const [stepIndex, setStepIndex] = useState<number>(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return 0;

  const data = JSON.parse(saved);

  return data.stepIndex ?? 0;
});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [stage, setStage] = useState<WizardStage>("filling");
  const [remoteError, setRemoteError] = useState<AppError | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

useEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      answers,
      stepIndex,
    })
  );
}, [answers, stepIndex]);

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
    },
    [clearError],
  );

  const toggleValue = useCallback(
    (question: ChoiceQuestion, value: string) => {
      setAnswers((previous) => toggleAnswer(previous, question, value));
      clearError(question.id);
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
        saveAssessmentRecord(result.value);
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
    [submitSurvey, jumpToFirstError],
  );

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
    setAnswers({});
    setErrors({});
    setStepIndex(0);
    setAssessment(null);
    setRemoteError(null);
    setStage("filling");
    localStorage.removeItem(STORAGE_KEY);
    scrollToTop();
  }, []);

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

    valueOf: (id) => readText(answers, id),
    selectionOf: (id) => readList(answers, id),
    setValue,
    toggleValue,
    goNext,
    goBack,
    restart,
  };
}
