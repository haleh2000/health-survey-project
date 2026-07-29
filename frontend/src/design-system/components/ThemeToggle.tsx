import { cn } from "@ds/lib/cn";
import { ThemeMode, useThemeMode } from "@ds/theme/useThemeMode";

const LABELS: Record<ThemeMode, string> = {
  system: "هماهنگ با سیستم",
  light: "روشن",
  dark: "تیره",
};

const ICONS: Record<ThemeMode, string> = {
  // Sun, moon, and a half-filled circle for "follow the system".
  system: "M10 2a8 8 0 000 16V2z",
  light:
    "M10 6a4 4 0 100 8 4 4 0 000-8zM10 1v2M10 17v2M3.6 3.6l1.4 1.4M15 15l1.4 1.4M1 10h2M17 10h2M3.6 16.4L5 15M15 5l1.4-1.4",
  dark: "M16 12.5A7 7 0 017.5 4a7 7 0 108.5 8.5z",
};

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, cycle } = useThemeMode();

  return (
    <button
      type="button"
      onClick={cycle}
      title={`نمایش: ${LABELS[mode]}`}
      aria-label={`تغییر پوسته. حالت فعلی: ${LABELS[mode]}`}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full",
        "text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="size-4.5 text-white" fill="none" aria-hidden>
        <path
          d={ICONS[mode]}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={mode === ThemeMode.System ? "currentColor" : "none"}
        />
        {mode === ThemeMode.System && (
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
        )}
      </svg>
    </button>
  );
}
