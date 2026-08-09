import { motion } from "framer-motion";

import { ProgressBar } from "@ds/components/ProgressBar";
import { ThemeToggle } from "@ds/components/ThemeToggle";
import { cn } from "@ds/lib/cn";

import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import { persianInteger } from "@survey/presentation/format/persian";
import { MotivationalMessage } from "./MotivationalMessage";

export interface StepTimelineProps {
  steps: readonly SurveyStep[];
  stepIndex: number;
  answeredCount: number;
  totalCount: number;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Desktop-only vertical timeline of survey steps.
 * Sits as a sticky sidebar; the mobile header covers small screens.
 */
export function StepTimeline({
  steps,
  stepIndex,
  answeredCount,
  totalCount,
}: StepTimelineProps) {
  return (
    <aside className="sticky top-6 hidden self-start lg:block">
      <div className="rounded-card bg-head p-6 shadow-raised">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/15 pb-4">
          <h1 className="text-base font-bold text-white">پرسشنامه سلامت</h1>
          <ThemeToggle />
        </div>

        <ol>
          {steps.map((step, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;
            const last = index === steps.length - 1;

            return (
              <li key={step.id} className="relative flex gap-4">
                {/* Rail: dot + connector down to the next step. */}
                <div className="flex flex-col items-center">
                  <motion.span
                    animate={{ scale: current ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "num-fa relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300",
                      done && "border-day-primary bg-day-primary text-white",
                      current &&
                        "border-day-primary bg-white text-day-primary shadow-[0_0_0_5px_rgba(0,160,175,0.3)]",
                      !done && !current && "border-white/25 text-white/50",
                    )}
                  >
                    {done ? <CheckIcon /> : persianInteger(index + 1)}
                  </motion.span>

                  {!last && (
                    <span className="relative my-1 w-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
                      <motion.span
                        className="absolute inset-x-0 top-0 bg-day-primary"
                        initial={false}
                        animate={{ height: done ? "100%" : "0%" }}
                        transition={{ type: "spring", stiffness: 160, damping: 26 }}
                      />
                    </span>
                  )}
                </div>

                <div className={cn("min-w-0 pb-7", last && "pb-0")}>
                  <p
                    className={cn(
                      "pt-1.5 text-sm leading-snug transition-colors duration-300",
                      current && "font-bold text-white",
                      done && "font-medium text-white/80",
                      !done && !current && "text-white/45",
                    )}
                  >
                    {step.title}
                  </p>
                  {current && step.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="mt-1 text-xs leading-relaxed text-white/60"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 border-t border-white/15 pt-4">
          <ProgressBar
            value={answeredCount}
            max={totalCount}
            label={`${persianInteger(answeredCount)} از ${persianInteger(totalCount)} پاسخ`}
          />
          <MotivationalMessage
            answeredCount={answeredCount}
            totalCount={totalCount}
            className="mt-3"
          />
        </div>
      </div>
    </aside>
  );
}
