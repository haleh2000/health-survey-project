import { cn } from "@ds/lib/cn";

export interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "در حال بارگذاری" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-5 animate-spin rounded-full",
        "border-2 border-accent border-t-transparent",
        className,
      )}
    />
  );
}
