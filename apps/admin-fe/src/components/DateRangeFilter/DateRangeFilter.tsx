import { Popover, Portal } from "@ark-ui/react";
import clsx from "clsx";
import { Calendar, ChevronDown, X } from "lucide-react";
import { useState } from "react";

import { BsDateHelper } from "@repo/shared";

import { BsCalendar } from "#/components/BsCalendar/BsCalendar";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

interface DateRangeFilterProps {
  /** AD `YYYY-MM-DD`; shown and picked in Bikram Sambat. */
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  maxRangeMonths?: number;
  disabled?: boolean;
  placeholder?: string;
}

function formatRange(start: string | null, end: string | null): string {
  if (!start && !end) return "";
  const from = start ? DateHelper.formatCalendarDate(start) : "…";
  const to = end ? DateHelper.formatCalendarDate(end) : "…";
  return `${from} – ${to}`;
}

export function DateRangeFilter({
  start,
  end,
  onChange,
  maxRangeMonths = 3,
  disabled,
  placeholder,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  // First click of a new range; the committed range stays in the URL until
  // the second click completes it.
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const triggerLabel = formatRange(start, end);
  const hasSelection = triggerLabel !== "";
  const resolvedPlaceholder = placeholder ?? m.filter_date_placeholder();

  let max: string | undefined;
  if (pendingStart) {
    try {
      max = BsDateHelper.toAdIso(
        BsDateHelper.addMonths(
          BsDateHelper.fromAdIso(pendingStart),
          maxRangeMonths,
        ),
      );
    } catch {
      max = undefined;
    }
  }

  function select(date: string) {
    if (!pendingStart || date < pendingStart) {
      setPendingStart(date);
      return;
    }
    onChange(pendingStart, date);
    setPendingStart(null);
    setIsOpen(false);
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => {
        setIsOpen(details.open);
        setPendingStart(null);
      }}
      positioning={{ placement: "bottom-start" }}
      lazyMount
      unmountOnExit
    >
      <div className="relative">
        <Popover.Trigger
          disabled={disabled}
          className={clsx(
            "inline-flex w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2 sm:w-80",
            "text-sm text-foreground-muted transition-colors hover:bg-surface-muted",
            "cursor-pointer focus:ring-0 focus:outline-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <Calendar size={14} className="shrink-0 text-foreground-subtle" />
            <span
              className={clsx(
                "truncate",
                !hasSelection && "text-foreground-faint",
              )}
            >
              {hasSelection ? triggerLabel : resolvedPlaceholder}
            </span>
          </span>
          <ChevronDown size={14} className="shrink-0 text-foreground-subtle" />
        </Popover.Trigger>

        {hasSelection && !disabled && (
          <button
            type="button"
            aria-label={m.filter_date_clear()}
            onClick={(event) => {
              event.stopPropagation();
              onChange(null, null);
            }}
            className={clsx(
              "absolute top-1/2 right-8 -translate-y-1/2 rounded p-0.5",
              "cursor-pointer text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted",
            )}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <Portal>
        <Popover.Positioner className="z-50">
          <Popover.Content className="rounded-lg border border-border bg-surface p-3 shadow-lg focus:outline-none">
            <BsCalendar
              selected={
                pendingStart
                  ? [pendingStart]
                  : [start, end].filter((d): d is string => !!d)
              }
              max={max}
              onSelect={select}
            />
            <p className="mt-2 text-xs text-foreground-subtle">
              {pendingStart ? m.calendar_pick_end() : m.calendar_pick_start()}
            </p>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
