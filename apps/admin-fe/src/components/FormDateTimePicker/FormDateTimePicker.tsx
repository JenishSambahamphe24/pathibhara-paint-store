import type { DateValue } from "@ark-ui/react/date-picker";

import {
  createListCollection,
  DatePicker,
  Field,
  parseDate,
  Portal,
} from "@ark-ui/react";
import clsx from "clsx";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useMemo } from "react";

import { useFieldContext } from "#/lib/formContext";
import { DateHelper } from "#/lib/helpers/date.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { TimeUnitSelect } from "./TimeUnitSelect";

interface FormDateTimePickerProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  /**
   * Lower bound for the calendar (day-level). Accepts a `YYYY-MM-DDTHH:mm`
   * string or an ISO timestamp. Dates before this value are disabled. Time
   * within the same day is not enforced here — submit-time validation
   * handles strict `end > start` checks.
   */
  min?: string | null;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, idx) =>
  idx.toString().padStart(2, "0"),
);

const HOUR_ITEMS = HOURS.map((h) => ({ value: h, label: h }));
const MINUTE_ITEMS = MINUTES.map((mm) => ({ value: mm, label: mm }));

function splitValue(value: string | null): {
  datePart: string | null;
  hour: string;
  minute: string;
} {
  if (!value) return { datePart: null, hour: "00", minute: "00" };
  const [datePart, timePart = "00:00"] = value.split("T");
  const [hh = "00", mm = "00"] = timePart.split(":");
  return { datePart, hour: hh, minute: mm };
}

function compose(datePart: string, hour: string, minute: string): string {
  return `${datePart}T${hour}:${minute}`;
}

/**
 * Returns the (hour, minute) tuple at or after `(minHour, minMinute)`,
 * starting from the candidate (h, m). Used to bump the time up when the
 * user picks a same-as-min date that would otherwise leave the combined
 * value behind the min boundary.
 */
function clampTime(
  h: string,
  mm: string,
  minHour: string,
  minMinute: string,
): { hour: string; minute: string } {
  if (h > minHour) return { hour: h, minute: mm };
  if (h < minHour) return { hour: minHour, minute: minMinute };
  return { hour: h, minute: mm < minMinute ? minMinute : mm };
}

export function FormDateTimePicker({
  label,
  required = false,
  placeholder,
  min,
}: FormDateTimePickerProps) {
  const field = useFieldContext<string | null>();
  const error = FormHelper.getFieldError(field.state.meta.errors);
  const value = field.state.value;
  const { datePart, hour, minute } = splitValue(value);

  const calendarValue: Array<DateValue> = useMemo(
    () => (datePart ? parseDate([datePart]) : []),
    [datePart],
  );

  const minParts = useMemo(() => {
    if (!min) return null;
    const parsed = splitValue(min);
    if (!parsed.datePart) return null;
    return {
      datePart: parsed.datePart,
      hour: parsed.hour,
      minute: parsed.minute,
    };
  }, [min]);

  const minDate = useMemo(
    () => (minParts ? parseDate([minParts.datePart])[0] : undefined),
    [minParts],
  );

  // Flatten min-day/min-hour bounds to plain nullable strings so the
  // collection callbacks can do a simple non-null check without TS having
  // to narrow through a boolean intermediate.
  const minHourBound =
    minParts && datePart === minParts.datePart ? minParts.hour : null;
  const minMinuteBound =
    minParts && datePart === minParts.datePart && hour === minParts.hour
      ? minParts.minute
      : null;

  const hourCollection = useMemo(
    () =>
      createListCollection({
        items: HOUR_ITEMS,
        isItemDisabled: (item) =>
          minHourBound !== null && item.value < minHourBound,
      }),
    [minHourBound],
  );

  const minuteCollection = useMemo(
    () =>
      createListCollection({
        items: MINUTE_ITEMS,
        isItemDisabled: (item) =>
          minMinuteBound !== null && item.value < minMinuteBound,
      }),
    [minMinuteBound],
  );

  const triggerLabel = value
    ? DateHelper.format(value, "lll")
    : (placeholder ?? "");
  const hasSelection = value !== null && value !== "";
  const resolvedPlaceholder = placeholder ?? m.generic_select_placeholder();

  function emit(next: string | null) {
    field.handleChange(next);
    if (field.state.meta.errorMap.onServer) {
      field.setMeta((meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onServer: undefined },
      }));
    }
  }

  function onDateChange(details: { value: Array<DateValue> }) {
    if (details.value.length === 0) {
      emit(null);
      return;
    }
    const nextDate = details.value[0].toString();
    const clamped =
      minParts && nextDate === minParts.datePart
        ? clampTime(hour, minute, minParts.hour, minParts.minute)
        : { hour, minute };
    emit(compose(nextDate, clamped.hour, clamped.minute));
  }

  function onTimeChange(nextHour: string, nextMinute: string) {
    if (!datePart) return;
    const clamped =
      minParts && datePart === minParts.datePart
        ? clampTime(nextHour, nextMinute, minParts.hour, minParts.minute)
        : { hour: nextHour, minute: nextMinute };
    emit(compose(datePart, clamped.hour, clamped.minute));
  }

  return (
    <Field.Root invalid={!!error} className="relative">
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <DatePicker.Root
        selectionMode="single"
        value={calendarValue}
        onValueChange={onDateChange}
        onOpenChange={(d) => {
          if (!d.open) field.handleBlur();
        }}
        positioning={{ placement: "bottom-start" }}
        min={minDate}
        lazyMount
        unmountOnExit
      >
        <DatePicker.Control className="relative">
          <DatePicker.Trigger
            className={clsx(
              "inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2.5",
              "text-sm text-foreground transition-colors",
              "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
              "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
              "cursor-pointer focus:outline-none",
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              <Calendar size={14} className="shrink-0 text-foreground-subtle" />
              <span
                className={clsx(
                  "truncate text-left",
                  !hasSelection && "text-foreground-faint",
                )}
              >
                {hasSelection ? triggerLabel : resolvedPlaceholder}
              </span>
            </span>
            <ChevronDown
              size={14}
              className="shrink-0 text-foreground-subtle"
            />
          </DatePicker.Trigger>

          {hasSelection && (
            <button
              type="button"
              aria-label={m.generic_clear()}
              onClick={(event) => {
                event.stopPropagation();
                emit(null);
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
          <DatePicker.Positioner className="z-popover" style={{ zIndex: 60 }}>
            <DatePicker.Content
              className={clsx(
                "rounded-lg border border-border bg-surface p-3 shadow-lg",
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

              <div className="mt-3 flex items-center gap-2 border-t border-border-muted pt-3">
                <span className="text-xs text-foreground-faint">
                  {m.generic_time_label()}
                </span>
                <TimeUnitSelect
                  value={hour}
                  collection={hourCollection}
                  disabled={!datePart}
                  onValueChange={(next) => onTimeChange(next, minute)}
                />
                <span className="text-sm text-foreground-faint">:</span>
                <TimeUnitSelect
                  value={minute}
                  collection={minuteCollection}
                  disabled={!datePart}
                  onValueChange={(next) => onTimeChange(hour, next)}
                />
              </div>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>

      {error && (
        <Field.ErrorText className="text-xs text-danger">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
