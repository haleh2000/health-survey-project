import { motion } from "framer-motion";

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

/** Critically-damped spring — snappy settle, no distracting bounce. */
const press = { type: "spring", stiffness: 500, damping: 30 } as const;

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
    <motion.label
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={press}
      className={cn(
        "group relative flex cursor-pointer select-none items-center gap-3 rounded-control border-2 px-4 py-3.5",
        "transition-[border-color,background-color,box-shadow] duration-150",
        checked
          ? "border-day-primary bg-white shadow-[0_4px_16px_rgba(0,58,64,0.18),inset_0_0_0_1px_rgba(0,153,168,0.15)]"
          : "border-transparent bg-white/90 shadow-[0_1px_3px_rgba(0,58,64,0.08)] hover:bg-white hover:shadow-[0_4px_14px_rgba(0,58,64,0.12)]",
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
          "flex size-5.5 shrink-0 items-center justify-center border-2 transition-colors duration-150",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked
            ? "border-day-primary bg-day-primary"
            : "border-gray-300 bg-white group-hover:border-day-primary/50",
        )}
      >
        {checked &&
          (type === "radio" ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 22 }}
              className="size-2 rounded-full bg-white"
            />
          ) : (
            <motion.svg
              viewBox="0 0 16 16"
              className="size-3.5 text-white"
              fill="none"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 22 }}
            >
              <path
                d="M3.5 8.5l3 3 6-6.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
      </span>

      <span
        className={cn(
          "text-sm leading-relaxed transition-colors duration-150",
          checked ? "font-semibold text-day-primary" : "text-gray-500 group-hover:text-gray-700",
        )}
      >
        {label}
      </span>
    </motion.label>
  );
}
