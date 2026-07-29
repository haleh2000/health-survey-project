import type { SelectHTMLAttributes } from "react";

import { cn } from "@ds/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

export function Select({
  options,
  placeholder,
  invalid = false,
  className,
  ...rest
}: SelectProps) {
  return (
    <div className="relative ">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 w-full appearance-none rounded-control border bg-white px-4 pl-9 text-sm text-gray-500",
          "transition-colors duration-150",
          "focus:border-day-second focus:outline-none focus:ring-1 focus:ring-day-second",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-danger" : "border-line-strong",
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <svg
        viewBox="0 0 20 20"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-gray-500"
        fill="none"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
