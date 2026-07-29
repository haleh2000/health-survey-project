import { ProgressBar } from "@ds/components/ProgressBar";
import { ThemeToggle } from "@ds/components/ThemeToggle";
import { cn } from "@ds/lib/cn";

import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import { persianInteger, persianRatio } from "@survey/presentation/format/persian";

export interface SurveyHeaderProps {
  steps: readonly SurveyStep[];
  stepIndex: number;
  answeredCount: number;
  totalCount: number;
}

/**
 * Sticky progress header.
 *
 * The bar tracks answered questions rather than completed steps, because steps
 * differ in length and a step-based bar would sit still through six questions
 * and then leap.
 */
export function SurveyHeader({
  steps,
  stepIndex,
  answeredCount,
  totalCount,
}: SurveyHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-head/95 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-sm font-semibold text-ink">پرسشنامه سلامت</h1>
          <div className="flex items-center gap-1">
            <span className="num-fa text-white text-xs text-ink-subtle">
              گام {persianRatio(stepIndex + 1, steps.length)}
            </span>
            <ThemeToggle />
          </div>
        </div>

        <ProgressBar
          value={answeredCount}
          max={totalCount}
          label={`${persianInteger(answeredCount)} پرسش از ${persianInteger(totalCount)} پاسخ داده شده`}
        />

        <ol className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {steps.map((step, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;

            return (
              <li key={step.id} className="shrink-0">
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "rounded-full text-white px-3 py-1 text-[0.7rem] whitespace-nowrap transition-colors",
                    current && "bg-day-primary text-white",
                    done && "bg-accent-soft text-white",
                    !current && !done && "text-ink-subtle",
                  )}
                >
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
