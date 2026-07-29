import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@ds/lib/cn";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Trailing unit label, e.g. "سانتی‌متر". */
  suffix?: ReactNode;
}

export function TextInput({ invalid = false, suffix, className, ...rest }: TextInputProps) {
  return (
    <div className="relative">
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 w-full rounded-control border bg-white px-4 text-sm text-gray-700",
          "transition-colors duration-150 placeholder:text-ink-subtle",
          "focus:border-2 focus:shadow-[0_0_12px_rgba(255,255,255,0.35)] focus:border-[#003a40a8] focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-danger" : "border-line-strong",
          suffix ? "pl-20" : null,
          className,
        )}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs text-ink-subtle">
          {suffix}
        </span>
      )}
    </div>
  );
}
