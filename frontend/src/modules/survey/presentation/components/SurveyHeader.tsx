// src/modules/survey/presentation/components/SurveyHeader.tsx

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ProgressBar } from "@ds/components/ProgressBar";
import { cn } from "@ds/lib/cn";

import type { SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import { persianInteger } from "@survey/presentation/format/persian";
import { MotivationalMessage } from "./MotivationalMessage";

export interface SurveyHeaderProps {
  steps: readonly SurveyStep[];
  stepIndex: number;
  answeredCount: number;
  totalCount: number;
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5"
    fill="none"
    aria-hidden
  >
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function useCollapsedOnScroll(threshold = 24) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");

    const update = () => {
      setCollapsed(
        mq.matches && window.scrollY > threshold,
      );
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    mq.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
    };
  }, [threshold]);

  return collapsed;
}

export function SurveyHeader({
  steps,
  stepIndex,
  answeredCount,
  totalCount,
}: SurveyHeaderProps) {
  const collapsed = useCollapsedOnScroll();

  return (
    
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-line
        bg-head/95
        backdrop-blur-md
      "
    >
      <div
        className={cn(
          "mx-auto w-full max-w-2xl px-4 transition-[padding] duration-300 sm:px-5",
          collapsed
            ? "py-2"
            : "pt-3 pb-2 sm:pt-4 sm:pb-3",
        )}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="header-top"
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className="overflow-hidden"
            >
              <ProgressBar
                value={answeredCount}
                max={totalCount}
                label={`${persianInteger(
                  answeredCount,
                )} پرسش از ${persianInteger(
                  totalCount,
                )} پاسخ داده شده`}
              />

              <MotivationalMessage
                answeredCount={answeredCount}
                totalCount={totalCount}
                className="mt-2"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ol
          className={cn(
            "flex w-full items-center transition-[margin] duration-300",
            collapsed
              ? "mt-0"
              : "mt-3 sm:mt-4",
          )}
        >
          {steps.flatMap(
            (step, index) => {
              const done =
                index < stepIndex;

              const current =
                index === stepIndex;

              const nodes = [];

              if (index > 0) {
                const connectorActive =
                  index <= stepIndex;

                nodes.push(
                  <li
                    key={`connector-${step.id}`}
                    aria-hidden
                    className="flex-1 px-0.5 sm:px-1"
                  >
                    <span
                      className={cn(
                        "block h-0.5 rounded-full transition-colors duration-300",
                        connectorActive
                          ? "bg-day-primary"
                          : "bg-white/25",
                      )}
                    />
                  </li>,
                );
              }

              nodes.push(
                <li
                  key={step.id}
                  className="flex shrink-0 flex-col items-center gap-1"
                >
                  <motion.span
                    animate={{
                      scale: current
                        ? 1.12
                        : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 18,
                    }}
                    aria-current={
                      current
                        ? "step"
                        : undefined
                    }
                    title={step.title}
                    className={cn(
                      "num-fa flex size-6 items-center justify-center rounded-full border text-[0.65rem] font-semibold transition-all duration-300 sm:size-7 sm:text-[0.7rem]",

                      done &&
                        "border-day-primary bg-day-primary text-white",

                      current &&
                        "border-day-primary bg-white text-day-primary shadow-[0_0_0_4px_rgba(0,153,168,0.25)]",

                      !done &&
                        !current &&
                        "border-white/30 text-white/60",
                    )}
                  >
                    {done ? (
                      <CheckIcon />
                    ) : (
                      persianInteger(
                        index + 1,
                      )
                    )}
                  </motion.span>

                  <span
                    className={cn(
                      "whitespace-nowrap text-center text-[0.6rem] leading-tight transition-colors sm:text-[0.65rem]",

                      collapsed &&
                        "hidden",

                      current &&
                        "font-semibold text-white",

                      done &&
                        "text-white/80",

                      !done &&
                        !current &&
                        "text-white/50",
                    )}
                  >
                    {step.title}
                  </span>
                </li>,
              );

              return nodes;
            },
          )}
        </ol>
      </div>
    </header>
  );
}