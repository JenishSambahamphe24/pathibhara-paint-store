import type { ReactNode } from "react";

import { Portal, Tooltip } from "@ark-ui/react";
import clsx from "clsx";

type TActionButtonVariant = "neutral" | "danger" | "success" | "warning";

type TActionButtonSize = "default" | "large";

interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  variant?: TActionButtonVariant;
  disabled?: boolean;
  active?: boolean;
  /** Carries the variant color without waiting for hover — for the one or two
   * decisive actions in a row, where the color is the affordance. */
  solid?: boolean;
  size?: TActionButtonSize;
}

const variantClasses: Record<TActionButtonVariant, string> = {
  neutral:
    "text-foreground-faint hover:bg-surface-subtle hover:text-foreground-muted",
  danger: "text-foreground-faint hover:bg-danger-subtle hover:text-danger",
  success: "text-foreground-faint hover:bg-success-subtle hover:text-success",
  warning: "text-foreground-faint hover:bg-warning-subtle hover:text-warning",
};

const activeVariantClasses: Record<TActionButtonVariant, string> = {
  neutral: "text-foreground-muted hover:bg-surface-subtle",
  danger: "text-danger hover:bg-danger-subtle",
  success: "text-success hover:bg-success-subtle",
  warning: "text-warning hover:bg-warning-subtle",
};

const sizeClasses: Record<TActionButtonSize, string> = {
  default: "p-1.5",
  large: "p-2",
};

export function ActionButton({
  icon,
  tooltip,
  onClick,
  variant = "neutral",
  disabled = false,
  active = false,
  solid = false,
  size = "default",
}: ActionButtonProps) {
  return (
    <Tooltip.Root
      openDelay={300}
      closeDelay={0}
      positioning={{ placement: "top" }}
    >
      <Tooltip.Trigger asChild>
        {/* Without an explicit type a button inside a form is a submit button:
            clicking it would save the form, and Enter would "click" it. */}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={clsx(
            "cursor-pointer rounded-md transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            sizeClasses[size],
            active || solid
              ? activeVariantClasses[variant]
              : variantClasses[variant],
          )}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content className="animate-in fade-in-0 zoom-in-95 z-50 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground-muted shadow-lg">
            {tooltip}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
