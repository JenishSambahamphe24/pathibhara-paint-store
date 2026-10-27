import { Popover, Portal } from "@ark-ui/react";
import clsx from "clsx";
import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

import { BsCalendar } from "#/components/BsCalendar/BsCalendar";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

interface BsDatePickerProps {
  /** AD `YYYY-MM-DD`, or "" when nothing is picked. */
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  onBlur?: () => void;
}

export function BsDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  invalid = false,
  disabled = false,
  size = "md",
  onBlur,
}: BsDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => {
        setIsOpen(details.open);
        if (!details.open) onBlur?.();
      }}
      positioning={{ placement: "bottom-start" }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={clsx(
          "inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-sm text-foreground",
          "cursor-pointer transition-colors hover:bg-surface-muted focus:outline-none",
          "focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/10",
          "disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-foreground-subtle",
          invalid ? "border-danger" : "border-border-strong",
          size === "sm" ? "py-1.5" : "py-2.5",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Calendar size={14} className="shrink-0 text-foreground-subtle" />
          <span className={clsx("truncate", !value && "text-foreground-faint")}>
            {value
              ? DateHelper.formatCalendarDate(value)
              : (placeholder ?? m.calendar_pick_date())}
          </span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-foreground-subtle" />
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner className="z-50">
          <Popover.Content className="rounded-lg border border-border bg-surface p-3 shadow-lg focus:outline-none">
            <BsCalendar
              selected={value ? [value] : []}
              min={min}
              max={max}
              onSelect={(date) => {
                onChange(date);
                setIsOpen(false);
                onBlur?.();
              }}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
