import type { ReactNode } from "react";

import { Checkbox as ArkCheckbox } from "@ark-ui/react";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";

type TCheckedState = boolean | "indeterminate";

interface CheckboxProps {
  checked: TCheckedState;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  label,
  description,
  className,
}: CheckboxProps) {
  return (
    <ArkCheckbox.Root
      checked={checked}
      onCheckedChange={(details) => onCheckedChange(details.checked === true)}
      disabled={disabled}
      className={clsx(
        "inline-flex cursor-pointer items-start gap-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <ArkCheckbox.Control
        className={clsx(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          "border-border-strong bg-surface text-primary-foreground",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
          "data-disabled:cursor-not-allowed",
        )}
      >
        <ArkCheckbox.Indicator>
          <Check size={12} strokeWidth={3} />
        </ArkCheckbox.Indicator>
        <ArkCheckbox.Indicator indeterminate>
          <Minus size={12} strokeWidth={3} />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <ArkCheckbox.Label className="block text-sm text-foreground">
              {label}
            </ArkCheckbox.Label>
          )}
          {description && (
            <p className="text-xs text-foreground-subtle">{description}</p>
          )}
        </div>
      )}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}
