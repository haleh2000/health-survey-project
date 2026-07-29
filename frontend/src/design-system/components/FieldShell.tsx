import type { ReactNode } from "react";

import { cn } from "@ds/lib/cn";

export interface FieldShellProps {
  /** Anchor for programmatic scrolling, e.g. jumping to the first error. */
  id?: string;
  /** Rendered before the title, e.g. "۳". */
  index?: string;
  title: string;
  hint?: string;
  required?: boolean;
  error?: string;
  /**
   * Id of the single control this labels. Omit for radio/checkbox groups —
   * they have no one control, and should point `aria-labelledby` at `labelId`
   * instead.
   */
  htmlFor?: string;
  /** Id given to the title element, for `aria-labelledby`. */
  labelId?: string;
  /** Id given to the error text, for `aria-describedby`. */
  errorId?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The shared frame around every question: number, title, required marker,
 * hint and error slot. Centralising it means a new question type cannot
 * invent its own label or error styling.
 */
export function FieldShell({
  id,
  index,
  title,
  hint,
  required = false,
  error,
  htmlFor,
  labelId,
  errorId,
  children,
  className,
}: FieldShellProps) {
  const titleClasses = "flex items-start gap-2 text-[0.95rem] font-medium text-ink";

  const heading = (
    <>
      {index && (
        <span className="num-fa mt-px shrink-0 tabular-nums text-white">{index}.</span>
      )}
      <span className="leading-relaxed">
        {title}
        {required && (
          <span className="mr-1 text-day-red" aria-label="الزامی">
            *
          </span>
        )}
      </span>
    </>
  );

  return (
    <div id={id} className={cn("min-w-0", className)}>
      <div className="mb-3">
        {htmlFor ? (
          <label id={labelId} htmlFor={htmlFor} className={titleClasses}>
            {heading}
          </label>
        ) : (
          <span id={labelId} className={titleClasses}>
            {heading}
          </span>
        )}

        {hint && <p className="mt-1.5 pr-5 text-xs leading-relaxed text-white">{hint}</p>}
      </div>

      {children}

      {error && (
        <p id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-day-red">
          <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="currentColor" aria-hidden>
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 4.5h1.5v5h-1.5v-5zm0 6.25h1.5v1.5h-1.5v-1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
