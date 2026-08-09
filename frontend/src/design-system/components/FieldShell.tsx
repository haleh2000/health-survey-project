import type { ReactNode } from "react";

import { cn } from "@ds/lib/cn";

export interface FieldShellProps {
  id?: string;
  index?: string;
  title: string;
  hint?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  labelId?: string;
  errorId?: string;
  children: ReactNode;
  className?: string;
}

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
  const titleClasses = "flex items-start gap-2 text-[0.95rem] font-medium text-white";

  const heading = (
    <>
      {index && (
        <span className="num-fa mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold tabular-nums text-white ring-1 ring-white/25">
          {index}
        </span>
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

        {hint && <p className="mt-1.5 pr-8 text-xs leading-relaxed text-white/85">{hint}</p>}
      </div>

      {children}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="animate-error-in mt-2 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-day-red shadow-sm"
        >
          <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="currentColor" aria-hidden>
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 4.5h1.5v5h-1.5v-5zm0 6.25h1.5v1.5h-1.5v-1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
