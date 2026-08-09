import { motion } from "framer-motion";

export interface ProgressSegmentConfig {
  count: number;
  color?: string;
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  segments?: ProgressSegmentConfig[];
}

export function ProgressBar({ value, max, label, segments }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const segs: ProgressSegmentConfig[] = segments ?? [{ count: max }];

  let cumulative = 0;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="num-fa text-xs text-white/90">{label}</span>
          <span className="num-fa text-xs text-white/70">
            {Math.round(percent)}٪
          </span>
        </div>
      )}

      <div className="flex w-full gap-1" dir="rtl">
        {segs.map((seg, i) => {
          const segStart = cumulative;
          const segEnd = cumulative + seg.count;
          cumulative = segEnd;

          const segProgress =
            value <= segStart
              ? 0
              : value >= segEnd
              ? 100
              : ((value - segStart) / seg.count) * 100;

          const isActive = value > segStart && value < segEnd;
          const color = seg.color ?? "bg-day-primary";

          return (
            <div
              key={i}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"
            >
              <motion.div
                className={`absolute inset-y-0 right-0 rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${segProgress}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
