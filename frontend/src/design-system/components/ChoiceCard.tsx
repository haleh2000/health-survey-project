import { cn } from "@ds/lib/cn";

export interface ChoiceCardProps {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export function ChoiceCard({
  type,
  name,
  value,
  label,
  checked,
  onSelect,
  disabled = false,
  invalid = false,
}: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-control border px-4 py-3",
        "transition-colors duration-150",
        checked
          ? "border-day-second bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)] "
          : "border-day-second bg-white hover:shadow-[0_0_12px_rgba(255,255,255,0.35)]",
        invalid && !checked && "border-danger/40",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="sr-only"
      />

      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border-2 transition-colors duration-150",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked ? "border-day-second" : "border-day-second ",
        )}
      >
        {checked &&
          (type === "radio" ? (
            <span className="size-2 rounded-full bg-head" />
          ) : (
            <svg viewBox="0 0 16 16" className="size-3.5 text-on-accent" fill="none">
              <path
                d="M3.5 8.5l3 3 6-6.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
      </span>

      <span className={cn("text-sm leading-relaxed", checked ? "text-gray-600" : "text-ink-subtle")}>
        {label}
      </span>
    </label>
  );
}
