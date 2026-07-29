import type { ReactNode } from "react";

import { cn } from "@ds/lib/cn";

type Tone = "error" | "info";

export interface AlertProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const TONES: Record<Tone, string> = {
  error: "border-danger/30 bg-danger-soft text-danger",
  info: "border-accent/25 bg-accent-soft text-ink-subtle",
};

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-control border px-4 py-3 text-sm leading-relaxed",
        TONES[tone],
        className,
      )}
    >
      {title && <p className="mb-1 font-medium">{title}</p>}
      {children}
    </div>
  );
}
