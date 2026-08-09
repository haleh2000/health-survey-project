import { useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { toAsciiDigits } from "@core/text/digits";
import { Alert } from "@ds/components/Alert";
import { Card } from "@ds/components/Card";

import { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { QuestionField } from "@survey/presentation/components/QuestionField";
import { RiskResultCard } from "@survey/presentation/components/RiskResultCard";
import { StepNav } from "@survey/presentation/components/StepNav";
import { StepTimeline } from "@survey/presentation/components/StepTimeline";
import { SurveyHeader } from "@survey/presentation/components/SurveyHeader";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { useSurveyWizard } from "@survey/presentation/state/useSurveyWizard";

/** Critically-damped spring — settles fast, no bounce (Apple's "move" feel). */
const stepSpring = { type: "spring", stiffness: 320, damping: 32 } as const;

export function SurveyPage() {
  const { definition } = useSurveyDependencies();
  const wizard = useSurveyWizard();

  // Direction of travel drives which side the step slides in from (RTL-aware).
  const previousStep = useRef(wizard.stepIndex);
  const direction = wizard.stepIndex >= previousStep.current ? 1 : -1;
  previousStep.current = wizard.stepIndex;

  const height = wizard.valueOf("height");
  const weight = wizard.valueOf("weight");

  const bodyMetrics = useMemo(
    () => BodyMetrics.create(Number(toAsciiDigits(height)), Number(toAsciiDigits(weight))),
    [height, weight],
  );

  if (wizard.stage === "completed" && wizard.assessment) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10">
        <RiskResultCard
          assessment={wizard.assessment}
          bodyMetrics={bodyMetrics}
          onRestart={wizard.restart}
        />
      </main>
    );
  }

  const submitting = wizard.stage === "submitting";

  return (
    <>
      {/* Compact sticky header on mobile; the sidebar timeline takes over on desktop. */}
      <div className="lg:hidden">
        <SurveyHeader
          steps={definition.steps}
          stepIndex={wizard.stepIndex}
          answeredCount={wizard.answeredCount}
          totalCount={wizard.totalCount}
        />
      </div>

      <div className="mx-auto max-w-2xl px-5 pt-6 pb-16 lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:pt-10">
        <main className="min-w-0">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
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
                  <h2 className="text-lg font-bold text-ink">{wizard.step.title}</h2>
                  {wizard.step.description && (
                    <p className="mt-1 text-sm text-white/85">{wizard.step.description}</p>
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
                        onSetValue={(value) => wizard.setValue(question, value)}
                        onToggleValue={(choiceQuestion, value) =>
                          wizard.toggleValue(choiceQuestion, value)
                        }
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
    </>
  );
}
