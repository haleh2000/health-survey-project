// src/modules/survey/presentation/pages/SurveyPage.tsx
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Alert } from "@ds/components/Alert";
import { Card } from "@ds/components/Card";
import { QuestionField } from "@survey/presentation/components/QuestionField";
import { StepNav } from "@survey/presentation/components/StepNav";
import { StepTimeline } from "@survey/presentation/components/StepTimeline";
import { SurveyHeader } from "@survey/presentation/components/SurveyHeader";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { useSurveyWizard } from "@survey/presentation/state/useSurveyWizard";
import { HealthDashboard } from "@survey/presentation/components/dashboard/HealthDashboard"
import { loadAssessmentHistory } from "@survey/infrastructure/storage/assessment-history.storage";
import { validateQuestion } from "@survey/domain/services/answer-validation.service";
import type { Question } from "@survey/domain/entities/question.entity";

const stepSpring = { type: "spring", stiffness: 320, damping: 32 } as const;

export function SurveyPage() {
  const { definition } = useSurveyDependencies();
  const wizard = useSurveyWizard();

  // useLayoutEffect prevents the direction read from happening during render
  const previousStepRef = useRef(wizard.stepIndex);
  const [direction, setDirection] = useState<1 | -1>(1);

  useLayoutEffect(() => {
    const next = wizard.stepIndex;
    setDirection(next >= previousStepRef.current ? 1 : -1);
    previousStepRef.current = next;
  }, [wizard.stepIndex]);

  /** Auto-advance to next question or step after answering. */
  const handleSetValue = useCallback(
    (question: Question, value: string) => {
      wizard.setValue(question, value);
      
      // Check if question is now answered and valid
      const error = validateQuestion(question, { ...wizard.answers, [question.id]: value });
      if (!error && wizard.questions.length > 0) {
        const currentIndex = wizard.questions.findIndex((q) => q.id === question.id);
        if (currentIndex >= 0 && currentIndex < wizard.questions.length - 1) {
          // Focus next question in same step
          const nextQuestion = wizard.questions[currentIndex + 1];
          if (nextQuestion) {
            requestAnimationFrame(() => {
              document.getElementById(`q-${nextQuestion.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
          }
        } else if (currentIndex === wizard.questions.length - 1) {
          // Last question in step - auto advance to next step
          wizard.goNext();
        }
      }
    },
    [wizard],
  );

  /** Auto-advance for choice questions (single/multi). */
  const handleToggleValue = useCallback(
    (question: Question, value: string) => {
      wizard.toggleValue(question as any, value);
      
      // For choice questions, check after a brief delay to allow state update
      setTimeout(() => {
        const error = validateQuestion(question, wizard.answers);
        if (!error && wizard.questions.length > 0) {
          const currentIndex = wizard.questions.findIndex((q) => q.id === question.id);
          if (currentIndex >= 0 && currentIndex < wizard.questions.length - 1) {
            const nextQuestion = wizard.questions[currentIndex + 1];
            if (nextQuestion) {
              requestAnimationFrame(() => {
                document.getElementById(`q-${nextQuestion.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              });
            }
          } else if (currentIndex === wizard.questions.length - 1) {
            wizard.goNext();
          }
        }
      }, 0);
    },
    [wizard],
  );

if (wizard.stage === "completed" && wizard.assessment) {
  const history = loadAssessmentHistory();
  const latestRecord = history[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <HealthDashboard record={latestRecord} history={history} />
      <button onClick={wizard.restart} className="mt-6 text-sm font-bold text-day-primary">
        ارزیابی مجدد
      </button>
    </main>
  );
}


  const submitting = wizard.stage === "submitting";

  return (
    <>
      <SurveyHeader
        steps={definition.steps}
        stepIndex={wizard.stepIndex}
        answeredCount={wizard.answeredCount}
        totalCount={wizard.totalCount}
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
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={wizard.step.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * -48, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction * 48, scale: 0.98 }}
                  transition={stepSpring}
                >
                  <Card padding="lg">
                    <div className="mb-6 border-b border-white/20 pb-4">
                      <h2 className="text-lg font-bold text-white">
                        {wizard.step.title}
                      </h2>
                      {wizard.step.description && (
                        <p className="mt-1 text-sm text-white">
                          {wizard.step.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-7">
                      {wizard.questions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 34,
                            delay: Math.min(index * 0.06, 0.3),
                          }}
                        >
                          <QuestionField
                            question={question}
                            position={index + 1}
                            value={wizard.valueOf(question.id)}
                            selected={wizard.selectionOf(question.id)}
                            error={wizard.errors[question.id]}
                            onSetValue={(value) => handleSetValue(question, value)}
                            onToggleValue={(choiceQuestion, value) => handleToggleValue(choiceQuestion, value)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {wizard.remoteError && (
                <Alert tone="error" title="ارسال انجام نشد" className="mt-4">
                  {wizard.remoteError.message}
                </Alert>
              )}

              <StepNav
                isFirstStep={wizard.stepIndex === 0}
                isLastStep={wizard.isLastStep}
                submitting={submitting}
                onBack={wizard.goBack}
                onNext={wizard.goNext}
              />
            </form>
          </main>

          <StepTimeline
            steps={definition.steps}
            stepIndex={wizard.stepIndex}
            answeredCount={wizard.answeredCount}
            totalCount={wizard.totalCount}
          />
        </div>
      </div>
    </>
  );
}
