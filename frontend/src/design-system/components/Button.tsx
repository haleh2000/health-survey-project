import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@ds/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "md" | "lg"| "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Renders a spinner and blocks interaction without changing the width. */
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
primary:
    "h-12 rounded-[14px] border-0 bg-gradient-to-r from-[#12adc1] to-[#078ba0] text-[1.05rem] font-bold text-white cursor-pointer shadow-[0_14px_30px_rgba(17,164,184,0.22)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(255,255,255,0.35)] active:translate-y-px",
  destructive:
    "bg-red-500 text-white hover:bg-red-600 active:translate-y-px",
  secondary:
    "cursor-pointer text-white border border-line-strong hover:bg-day-primary active:translate-y-px",
  ghost:
    "rounded-[14px] border-0 bg-gradient-to-r from-[#12adc1] to-[#078ba0] text-white text-[1.05rem] font-bold cursor-pointer shadow-[0_14px_30px_rgba(17,164,184,0.22)] transition-all duration-200 ease-in-out hover:-translate-y-0.5",
  outline:
    "border border-input bg-transparent text-foreground hover:shadow-[0_0_12px_rgba(255,255,255,0.35)]",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-11 w-11 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  startIcon,
  endIcon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium cursor-pointer bg-white text-gray-500",
        "transition-colors duration-150 select-none",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        startIcon
      )}
      {children}
      {!loading && endIcon}
    </button>
  );
}
