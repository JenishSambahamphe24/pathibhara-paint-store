import type { ButtonHTMLAttributes, ReactNode } from "react";

import clsx from "clsx";

type TButtonVariant = "primary" | "outline" | "danger";
type TButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<TButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground border border-transparent hover:opacity-90",
  outline:
    "bg-surface text-foreground-muted border border-border-strong hover:bg-surface-muted",
  danger:
    "bg-danger text-primary-foreground border border-transparent hover:bg-danger-strong",
};

const sizeClasses: Record<TButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {startIcon && <span className="shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="shrink-0">{endIcon}</span>}
    </button>
  );
}
