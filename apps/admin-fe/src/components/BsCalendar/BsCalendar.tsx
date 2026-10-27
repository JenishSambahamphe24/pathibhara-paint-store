import type { ISimpleDate } from "@repo/shared";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { BsDateHelper, NumeralHelper } from "@repo/shared";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

interface BsCalendarProps {
  /** AD `YYYY-MM-DD` dates, as the API stores them. Two dates mark a range. */
  selected: Array<string>;
  /** AD `YYYY-MM-DD` bounds, inclusive. */
  min?: string;
  max?: string;
  onSelect: (date: string) => void;
}

interface IMonth {
  year: number;
  month: number;
}

function initialMonth(selected: Array<string>): IMonth {
  const anchor = selected[0]
    ? BsDateHelper.fromAdIso(selected[0])
    : BsDateHelper.today();
  return { year: anchor.year, month: anchor.month };
}

function shiftMonth(month: IMonth, by: number): IMonth | null {
  try {
    return BsDateHelper.addMonths({ ...month, day: 1 }, by);
  } catch {
    return null;
  }
}

// Month grid in Bikram Sambat. Works in AD ISO strings at its edges, so the
// pickers around it hand the API the same values as before.
export function BsCalendar({ selected, min, max, onSelect }: BsCalendarProps) {
  const [view, setView] = useState<IMonth>(() => initialMonth(selected));
  const locale = DateHelper.bsLocale();
  const weekdays =
    locale === "ne" ? BsDateHelper.WEEKDAYS_NE : BsDateHelper.WEEKDAYS_EN;
  const today = DateHelper.todayInStore();
  const [rangeStart, rangeEnd] = selected;

  const first: ISimpleDate = { ...view, day: 1 };
  const length = BsDateHelper.daysInMonth(view.year, view.month);
  const days = Array.from({ length }, (_, i) => {
    const bs = { ...view, day: i + 1 };
    return { bs, ad: BsDateHelper.toAdIso(bs) };
  });
  const leadingBlanks = BsDateHelper.weekday(first);

  const previous = shiftMonth(view, -1);
  const next = shiftMonth(view, 1);
  const canGoBack =
    previous !== null &&
    (!min ||
      BsDateHelper.toAdIso({
        ...previous,
        day: BsDateHelper.daysInMonth(previous.year, previous.month),
      }) >= min);
  const canGoForward =
    next !== null && (!max || BsDateHelper.toAdIso({ ...next, day: 1 }) <= max);

  return (
    <div className="w-64">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={m.calendar_previous_month()}
          disabled={!canGoBack}
          onClick={() => previous && setView(previous)}
          className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span
          className="text-sm font-medium text-foreground"
          aria-live="polite"
        >
          {BsDateHelper.format(first, { locale, style: "monthYear" })}
        </span>
        <button
          type="button"
          aria-label={m.calendar_next_month()}
          disabled={!canGoForward}
          onClick={() => next && setView(next)}
          className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="py-1 text-center text-xs font-medium text-foreground-faint"
          >
            {weekday}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map(({ bs, ad }) => {
          const isDisabled = (!!min && ad < min) || (!!max && ad > max);
          const isSelected = ad === rangeStart || ad === rangeEnd;
          const isInRange =
            !!rangeStart && !!rangeEnd && ad > rangeStart && ad < rangeEnd;
          return (
            <button
              key={ad}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={BsDateHelper.format(bs, { locale, style: "long" })}
              onClick={() => onSelect(ad)}
              className={clsx(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-sm text-foreground-muted transition-colors",
                "hover:bg-surface-subtle",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                ad === today && "font-semibold text-foreground",
                isInRange && "bg-info-subtle text-info-strong",
                isSelected &&
                  "bg-info font-medium text-primary-foreground hover:bg-info",
              )}
            >
              {locale === "ne" ? NumeralHelper.toNepali(bs.day) : bs.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
