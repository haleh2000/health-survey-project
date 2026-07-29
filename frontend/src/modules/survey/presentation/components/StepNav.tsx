import { Button } from "@ds/components/Button";

export interface StepNavProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

const ArrowForward = () => (
  <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
    <path
      d="M12.5 5l-5 5 5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button variant="ghost" onClick={onBack} disabled={isFirstStep || submitting}>
        مرحله قبل
      </Button>

      <Button
        size="lg"
        onClick={onNext}
        loading={submitting}
        endIcon={isLastStep ? undefined : <ArrowForward />}
        className="min-w-40"
      >
        {isLastStep ? "محاسبه نتیجه" : "مرحله بعد"}
      </Button>
    </div>
  );
}
