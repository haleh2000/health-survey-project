import type { HTMLAttributes } from "react";

import { cn } from "@ds/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-9",
} as const;

export function Card({ padding = "md", className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-day-second bg-day-primary shadow-card",
        PADDING[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
