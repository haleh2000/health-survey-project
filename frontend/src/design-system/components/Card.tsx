// src/design-system/components/Card.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@ds/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  title?: string;
}

const PADDING = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-9",
} as const;

export function Card({ padding = "md", className, children, title, ...rest }: CardProps) {
  return (
    <div className="relative mb-8 sm:mb-2">
      {title && (
        <div className="absolute -top-3 sm:-top-3.5 right-4 sm:right-8 px-2.5 sm:px-3 py-0.5 rounded-full bg-gradient-to-r from-pink-200/60 to-pink-100/60 text-xs sm:text-sm font-medium text-pink-800">
          {title}
        </div>
      )}
      <div
        className={cn(
          "rounded-card border border-head bg-day-primary shadow-card",
          PADDING[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}
