// src/modules/survey/presentation/pages/SurveyPage.tsx

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { Alert } from "@ds/components/Alert";
import { Card } from "@ds/components/Card";

import { QuestionField } from "@survey/presentation/components/QuestionField";
import { StepNav } from "@survey/presentation/components/StepNav";
import { StepTimeline } from "@survey/presentation/components/StepTimeline";
import { SurveyHeader } from "@survey/presentation/components/SurveyHeader";

import { HealthDashboard } from "@survey/presentation/components/dashboard/HealthDashboard";

import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { useSurveyWizard } from "@survey/presentation/state/useSurveyWizard";

import {
  readText,
} from "@survey/domain/entities/survey-answers.entity";

import type {
  Question,
  QuestionId,
} from "@survey/domain/entities/question.entity";

import {
  loadAssessmentHistoryByNationalId,
  loadLastResult,
  mergeAssessmentHistories,
  normalizeNationalId,
  type AssessmentRecord,
} from "@survey/infrastructure/storage/assessment-history.storage";
import { useAssessmentHistory } from "@survey/presentation/hooks/useAssessmentHistory";
import { useAuth } from "../../../../auth/useAuth";

const stepSpring = {
  type: "spring",
  stiffness: 320,
  damping: 32,
} as const;

type SurveyLocationState = {
  selectedRecord?: AssessmentRecord;
};

export function SurveyPage() {
  const {
    definition,
  } = useSurveyDependencies();

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const navState = (location.state as SurveyLocationState | null) ?? null;
  const selectedRecordFromNav = navState?.selectedRecord ?? null;

  const wizard = useSurveyWizard();
  const sessionNationalId = user?.national_id
    ? normalizeNationalId(user.national_id)
    : "";
  const historyNationalId =
    readText(wizard.answers, "national_id" as QuestionId).trim() ||
    selectedRecordFromNav?.nationalId ||
    sessionNationalId;
  const { history: remoteHistory, refresh: refreshHistory } =
    useAssessmentHistory(historyNationalId);

  // ---------------------------------------------------------------------------
  // Step animation direction
  // ---------------------------------------------------------------------------

  const previousStepRef =
    useRef(
      wizard.stepIndex,
    );

  const [
    direction,
    setDirection,
  ] = useState<
    1 | -1
  >(1);

  useLayoutEffect(() => {
    const next =
      wizard.stepIndex;

    setDirection(
      next >=
        previousStepRef.current
        ? 1
        : -1,
    );

    previousStepRef.current =
      next;
  }, [
    wizard.stepIndex,
  ]);

  // ---------------------------------------------------------------------------
  // Question handlers
  // ---------------------------------------------------------------------------

  const handleSetValue =
    useCallback(
      (
        question: Question,
        value: string,
      ) => {
        wizard.setValue(
          question,
          value,
        );
      },
      [wizard],
    );

  const handleToggleValue =
    useCallback(
      (
        question: Question,
        value: string,
      ) => {
        wizard.toggleValue(
          question as any,
          value,
        );
      },
      [wizard],
    );

  useEffect(() => {
    if (wizard.stage !== "completed" || !wizard.assessment) return;
    void refreshHistory();
  }, [wizard.stage, wizard.assessment, refreshHistory]);

  const localHistory = historyNationalId
    ? loadAssessmentHistoryByNationalId(historyNationalId)
    : [];
  const lastResult = loadLastResult();
  const history = mergeAssessmentHistories(
    remoteHistory,
    localHistory,
    lastResult ? [lastResult] : [],
  );

  // ---------------------------------------------------------------------------
  // Viewing a historical record from WelcomePage
  // ---------------------------------------------------------------------------

  if (selectedRecordFromNav) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <HealthDashboard
          record={selectedRecordFromNav}
          history={history}
          nationalId={selectedRecordFromNav.nationalId}
        />
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Completed state
  // ---------------------------------------------------------------------------

  if (
    wizard.stage ===
      "completed" &&
    wizard.assessment
  ) {
    const latestRecord = history[0] ?? loadLastResult();
    const nationalId =
      historyNationalId || latestRecord?.nationalId || "";

    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <HealthDashboard
          record={latestRecord}
          history={
            history.length > 0
              ? history
              : latestRecord
                ? [latestRecord]
                : []
          }
          nationalId={nationalId}
        />

        <button
          type="button"
          onClick={() => {
            wizard.restart();
            navigate("/", { replace: true });
          }}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl
                     bg-gradient-to-r from-[#0fadb6] to-[#0a8a92] px-6 text-sm font-black text-white
                     shadow-[0_14px_30px_rgba(17,164,184,0.22)] transition hover:-translate-y-0.5
                     disabled:pointer-events-none disabled:opacity-60"
        >
          ارزیابی مجدد
        </button>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Filling / submitting
  // ---------------------------------------------------------------------------

  const submitting =
    wizard.stage ===
    "submitting";

  return (
    <>
      <SurveyHeader
        steps={
          definition.steps
        }
        stepIndex={
          wizard.stepIndex
        }
        answeredCount={
          wizard.answeredCount
        }
        totalCount={
          wizard.totalCount
        }
      />

      <div className="mx-auto max-w-2xl px-5 pt-6 pb-16 lg:max-w-5xl lg:pt-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <main className="min-w-0">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                wizard.goNext();
              }}
            >
              <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={
                  direction
                }
              >
                <motion.div
                  key={
                    wizard.step.id
                  }
                  custom={
                    direction
                  }
                  initial={{
                    opacity: 0,
                    x:
                      direction *
                      -48,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x:
                      direction *
                      48,
                    scale: 0.98,
                  }}
                  transition={
                    stepSpring
                  }
                >
                  <Card padding="lg">
                    <div className="mb-6 border-b border-white/20 pb-4">
                      <h2 className="text-lg font-bold text-white">
                        {
                          wizard
                            .step
                            .title
                        }
                      </h2>

                      {wizard.step.description && (
                        <p className="mt-1 text-sm text-white">
                          {
                            wizard
                              .step
                              .description
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-7">
                      {wizard.questions.map(
                        (
                          question,
                          index,
                        ) => (
                          <motion.div
                            key={
                              question.id
                            }
                            initial={{
                              opacity: 0,
                              y: 16,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 34,
                              delay:
                                Math.min(
                                  index *
                                    0.06,
                                  0.3,
                                ),
                            }}
                          >
                            <QuestionField
                              question={
                                question
                              }
                              position={
                                index +
                                1
                              }
                              value={wizard.valueOf(
                                question.id,
                              )}
                              selected={wizard.selectionOf(
                                question.id,
                              )}
                              error={
                                wizard
                                  .errors[
                                  question
                                    .id
                                ]
                              }
                              onSetValue={(
                                value,
                              ) =>
                                handleSetValue(
                                  question,
                                  value,
                                )
                              }
                              onToggleValue={(
                                choiceQuestion,
                                value,
                              ) =>
                                handleToggleValue(
                                  choiceQuestion,
                                  value,
                                )
                              }
                              readOnly={wizard.readOnlyIds.has(
                                question.id,
                              )}
                            />
                          </motion.div>
                        ),
                      )}
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {wizard.remoteError && (
                <Alert
                  tone="error"
                  title="ارسال انجام نشد"
                  className="mt-4"
                >
                  {
                    wizard
                      .remoteError
                      .message
                  }
                </Alert>
              )}

              <StepNav
                isFirstStep={false}
                isLastStep={
                  wizard.isLastStep
                }
                submitting={
                  submitting
                }
                onBack={() => {
                  if (wizard.stepIndex === 0) {
                    navigate("/");
                    return;
                  }
                  wizard.goBack();
                }}
                onNext={
                  wizard.goNext
                }
              />
            </form>
          </main>

          <StepTimeline
            steps={
              definition.steps
            }
            stepIndex={
              wizard.stepIndex
            }
            answeredCount={
              wizard.answeredCount
            }
            totalCount={
              wizard.totalCount
            }
          />
        </div>
      </div>
    </>
  );
}
