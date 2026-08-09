import { motion } from "framer-motion";

import { Button } from "@ds/components/Button";

export interface StepNavProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

const press = { type: "spring", stiffness: 500, damping: 30 } as const;

const ArrowForward = () => (
  <svg viewBox="0 0 20 20" className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" aria-hidden>
    <path
      d="M12.5 5l-5 5 5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Sparkle = () => (
  <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
    <path d="M10 2l1.8 4.6L16.5 8l-4.7 1.4L10 14l-1.8-4.6L3.5 8l4.7-1.4L10 2z" />
  </svg>
);

export function StepNav({
  isFirstStep,
  isLastStep,
  submitting,
  onBack,
  onNext,
}: StepNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <motion.div whileTap={{ scale: 0.96 }} transition={press}>
        <Button variant="ghost" onClick={onBack} disabled={isFirstStep || submitting}>
          مرحله قبل
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.96 }} transition={press}>
        <Button
          size="lg"
          onClick={onNext}
          loading={submitting}
          startIcon={isLastStep ? <Sparkle /> : undefined}
          endIcon={isLastStep ? undefined : <ArrowForward />}
          className="group min-w-40"
        >
          {isLastStep ? "محاسبه نتیجه" : "مرحله بعد"}
        </Button>
      </motion.div>
    </div>
  );
}
