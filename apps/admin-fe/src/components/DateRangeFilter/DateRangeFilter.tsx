import type { DateValue } from "@ark-ui/react/date-picker";

import { DatePicker, parseDate, Portal } from "@ark-ui/react";
import clsx from "clsx";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { m } from "#/paraglide/messages";

interface DateRangeFilterProps {
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  maxRangeMonths?: number;
  disabled?: boolean;
  placeholder?: string;
}

function formatRange(start: string | null, end: string | null): string {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – …`;
  return `… – ${end ?? ""}`;
}

export function DateRangeFilter({
  start,
  end,
  onChange,
  maxRangeMonths = 3,
  disabled,
  placeholder,
}: DateRangeFilterProps) {
  const committedValue: Array<DateValue> = useMemo(() => {
    const dates: Array<string> = [];
    if (start) dates.push(start);
    if (end) dates.push(end);
    return dates.length > 0 ? parseDate(dates) : [];
  }, [start, end]);

  const [internalValue, setInternalValue] =
    useState<Array<DateValue>>(committedValue);

  useEffect(() => {
    setInternalValue(committedValue);
  }, [committedValue]);

  const max = useMemo(() => {
    if (internalValue.length === 1) {
      return internalValue[0].add({ months: maxRangeMonths });
    }
    return undefined;
  }, [internalValue, maxRangeMonths]);

  const triggerLabel = formatRange(start, end);
  const hasSelection = triggerLabel !== "";
  const resolvedPlaceholder = placeholder ?? m.filter_date_placeholder();

  return (
    <DatePicker.Root
      selectionMode="range"
      value={internalValue}
      max={max}
      onValueChange={(details) => {
        setInternalValue(details.value);
        if (details.value.length === 0) {
          onChange(null, null);
        } else if (details.value.length === 2) {
          onChange(details.value[0].toString(), details.value[1].toString());
        }
      }}
      positioning={{ placement: "bottom-start" }}
      disabled={disabled}
    >
      <DatePicker.Control className="relative">
        <DatePicker.Trigger
          className={clsx(
            "inline-flex w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2 sm:w-72",
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
        </DatePicker.Trigger>

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
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content
            className={clsx(
              "z-50 rounded-lg border border-border bg-surface p-3 shadow-lg",
              "focus:ring-0 focus:outline-0",
            )}
          >
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl className="mb-2 flex items-center justify-between gap-2">
                      <DatePicker.PrevTrigger className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted">
                        <ChevronLeft size={16} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-surface-subtle">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted">
                        <ChevronRight size={16} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full border-collapse">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {api.weekDays.map((day, i) => (
                            <DatePicker.TableHeader
                              key={i}
                              className="px-1 py-1 text-center text-xs font-medium text-foreground-faint"
                            >
                              {day.short}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {api.weeks.map((week, i) => (
                          <DatePicker.TableRow key={i}>
                            {week.map((day, j) => (
                              <DatePicker.TableCell
                                key={j}
                                value={day}
                                className="p-0.5"
                              >
                                <DatePicker.TableCellTrigger
                                  className={clsx(
                                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-sm text-foreground-muted transition-colors",
                                    "hover:bg-surface-subtle",
                                    "data-outside-range:text-foreground-faint",
                                    "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:bg-transparent",
                                    "data-in-range:bg-info-subtle data-in-range:text-info-strong",
                                    "data-selected:bg-info data-selected:font-medium data-selected:text-primary-foreground data-selected:hover:bg-info",
                                    "data-today:font-semibold",
                                  )}
                                >
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}
