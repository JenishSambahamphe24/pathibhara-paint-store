import type { ReactNode } from "react";

import clsx from "clsx";

type TChipVariant = "success" | "primary" | "danger" | "warning" | "neutral";

interface ChipProps {
  variant?: TChipVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<TChipVariant, string> = {
  success: "bg-success-subtle text-success-strong border-success-border",
  primary: "bg-info-subtle text-info-strong border-info-border",
  danger: "bg-danger-subtle text-danger-strong border-danger-border",
  warning: "bg-warning-subtle text-warning-strong border-warning-border",
  neutral: "bg-surface-muted text-foreground-muted border-border",
};

export function Chip({ variant = "primary", children, className }: ChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
