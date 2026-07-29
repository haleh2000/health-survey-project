import { cn } from "@ds/lib/cn";

export interface ProgressBarProps {
  /** Completed units. */
  value: number;
  /** Total units. Must be greater than zero. */
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(Math.max(value / safeMax, 0), 1);

  return (
   <div className="rounded-full shadow-[0_0_12px_rgba(255,255,255,0.35)]">
  <div
    className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#7fc2c9]", className)}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={safeMax}
    aria-label={label ?? "میزان پیشرفت"}
  >
    <div
      className="h-full rounded-full bg-day-red transition-[width] duration-500 ease-[var(--ease-out-soft)]"
      style={{ width: `${ratio * 100}%` }}
    />
  </div>
</div>
  );
}
