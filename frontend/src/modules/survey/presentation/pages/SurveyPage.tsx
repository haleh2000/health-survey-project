import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { toAsciiDigits } from "@core/text/digits";
import { Alert } from "@ds/components/Alert";
import { Card } from "@ds/components/Card";

import { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { QuestionField } from "@survey/presentation/components/QuestionField";
import { RiskResultCard } from "@survey/presentation/components/RiskResultCard";
import { StepNav } from "@survey/presentation/components/StepNav";
import { SurveyHeader } from "@survey/presentation/components/SurveyHeader";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { useSurveyWizard } from "@survey/presentation/state/useSurveyWizard";

export function SurveyPage() {
  const { definition } = useSurveyDependencies();
  const wizard = useSurveyWizard();

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
      <SurveyHeader
        steps={definition.steps}
        stepIndex={wizard.stepIndex}
        answeredCount={wizard.answeredCount}
        totalCount={wizard.totalCount}
      />

      <main className="mx-auto max-w-2xl px-5 pt-6 pb-16">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            wizard.goNext();
          }}
        >
          <Card key={wizard.step.id} padding="lg" className="animate-step-in">
            <div className="mb-6 border-b border-day-second pb-4">
              <h2 className="text-lg font-semibold text-ink">{wizard.step.title}</h2>
              {wizard.step.description && (
                <p className="mt-1 text-sm text-white">{wizard.step.description}</p>
              )}
            </div>

            <div className="space-y-7">
              <AnimatePresence mode="wait">
                {wizard.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: index * 0.1,
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
              </AnimatePresence>
            </div>
          </Card>

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
    </>
  );
}
