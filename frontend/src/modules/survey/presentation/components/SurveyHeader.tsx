// src/modules/survey/presentation/components/SurveyHeader.tsx
import { motion } from "framer-motion";

import { ProgressBar } from "@ds/components/ProgressBar";
import { ThemeToggle } from "@ds/components/ThemeToggle";
import { cn } from "@ds/lib/cn";

import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import { persianInteger, persianRatio } from "@survey/presentation/format/persian";
import { MotivationalMessage } from "./MotivationalMessage";

export interface SurveyHeaderProps {
  steps: readonly SurveyStep[];
  stepIndex: number;
  answeredCount: number;
  totalCount: number;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
            <span className="num-fa text-white text-xs">
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

        <MotivationalMessage 
          answeredCount={answeredCount} 
          totalCount={totalCount} 
          className="mt-2" 
        />

        <ol className="mt-4 flex items-center">
          {steps.flatMap((step, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;
            const nodes = [];

            if (index > 0) {
              const connectorActive = index <= stepIndex;
              nodes.push(
                <li key={`connector-${step.id}`} aria-hidden className="flex-1 px-1">
                  <span
                    className={cn(
                      "block h-0.5 rounded-full transition-colors duration-300",
                      connectorActive ? "bg-day-primary" : "bg-white/25",
                    )}
                  />
                </li>,
              );
            }

            nodes.push(
              <li key={step.id} className="flex shrink-0 flex-col items-center gap-1.5">
                <motion.span
                  animate={{ scale: current ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  aria-current={current ? "step" : undefined}
                  title={step.title}
                  className={cn(
                    "num-fa flex size-7 items-center justify-center rounded-full border text-[0.7rem] font-semibold transition-all duration-300",
                    done && "border-day-primary bg-day-primary text-white",
                    current &&
                      "border-day-primary bg-white text-day-primary shadow-[0_0_0_4px_rgba(0,153,168,0.25)]",
                    !done && !current && "border-white/30 text-white/60",
                  )}
                >
                  {done ? <CheckIcon /> : persianInteger(index + 1)}
                </motion.span>
                <span
                  className={cn(
                    "text-center text-[0.65rem] leading-tight transition-colors whitespace-nowrap",
                    current && "font-semibold text-white",
                    done && "text-white/80",
                    !done && !current && "text-white/50",
                  )}
                >
                  {step.title}
                </span>
              </li>,
            );

            return nodes;
          })}
        </ol>
      </div>
    </header>
  );
}
