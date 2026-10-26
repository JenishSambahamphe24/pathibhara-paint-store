import { Switch as ArkSwitch } from "@ark-ui/react";
import clsx from "clsx";

type TSwitchVariant = "success" | "neutral";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  variant?: TSwitchVariant;
}

const checkedVariantClasses: Record<TSwitchVariant, string> = {
  success: "data-[state=checked]:bg-success",
  neutral: "data-[state=checked]:bg-foreground",
};

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  variant = "success",
}: SwitchProps) {
  return (
    <ArkSwitch.Root
      checked={checked}
      onCheckedChange={(details) => onCheckedChange(details.checked)}
      disabled={disabled}
      className={clsx(
        "inline-flex shrink-0 items-center",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <ArkSwitch.Control
        className={clsx(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
          "bg-surface-strong",
          checkedVariantClasses[variant],
          "data-disabled:cursor-not-allowed",
        )}
      >
        <ArkSwitch.Thumb
          className={clsx(
            "pointer-events-none block size-4 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform",
            "data-[state=checked]:translate-x-4",
          )}
        />
      </ArkSwitch.Control>
      {label && (
        <ArkSwitch.Label className="ml-2 text-sm text-foreground-muted">
          {label}
        </ArkSwitch.Label>
      )}
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  );
}
