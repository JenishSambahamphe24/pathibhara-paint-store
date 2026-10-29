import { BS_CALENDAR } from "./bs-calendar.data";

export interface ISimpleDate {
  year: number;
  /** 1–12, unlike JS `Date`. */
  month: number;
  day: number;
}

/**
 * iso       → 2083-07-10
 * long      → 10 Kartik 2083
 * dayMonth  → 10 Kartik
 * monthYear → Kartik 2083
 */
export type BsFormatStyle = "iso" | "long" | "dayMonth" | "monthYear";

const { minYear: MIN_YEAR, maxYear: MAX_YEAR } = BS_CALENDAR;

const MONTHS = Object.freeze([
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
]);
const WEEKDAYS = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

// BS 2000-01-01 is AD 1943-04-14. All AD arithmetic is done in UTC so the
// host's timezone can never shift a date.
const EPOCH_UTC = Date.UTC(1943, 3, 14);
const DAY_MS = 86_400_000;
// Nepal Standard Time is UTC+05:45 with no daylight saving.
const NPT_OFFSET_MS = (5 * 60 + 45) * 60_000;

interface ICalendarYear {
  year: number;
  /** Days from the epoch to 1 Baisakh of this year. */
  start: number;
  months: ReadonlyArray<number>;
}

const sum = (values: ReadonlyArray<number>) => values.reduce((a, b) => a + b, 0);

const years: Array<ICalendarYear> = [];
let totalDays = 0;
for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
  const months = BS_CALENDAR.monthLengths[year];
  years.push({ year, start: totalDays, months });
  totalDays += sum(months);
}

function calendarYear(year: number): ICalendarYear {
  const entry = years[year - MIN_YEAR] as ICalendarYear | undefined;
  if (!entry) {
    throw new RangeError(`BS year ${year} is outside the supported range ${MIN_YEAR}–${MAX_YEAR}`);
  }
  return entry;
}

function assertInteger(name: string, value: unknown): asserts value is number {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer, got ${String(value)}`);
}

function assertValid(date: ISimpleDate): void {
  const max = BsDateHelper.daysInMonth(date.year, date.month);
  assertInteger("day", date.day);
  if (date.day < 1 || date.day > max) {
    throw new RangeError(`${MONTHS[date.month - 1]} ${date.year} has ${max} days, got day ${date.day}`);
  }
}

const pad = (value: number) => String(value).padStart(2, "0");

// Bikram Sambat calendar. Dates are stored as AD (`date` columns, YYYY-MM-DD
// strings) so SQL date arithmetic keeps working; BS is shown and picked at the
// edges through `fromAdIso` / `toAdIso`. Invalid input throws instead of
// rolling over.
export class BsDateHelper {
  static readonly MIN_YEAR = MIN_YEAR;
  static readonly MAX_YEAR = MAX_YEAR;
  static readonly MONTHS = MONTHS;
  static readonly WEEKDAYS = WEEKDAYS;

  static daysInMonth(year: number, month: number): number {
    assertInteger("year", year);
    assertInteger("month", month);
    const days = calendarYear(year).months[month - 1] as number | undefined;
    if (days === undefined) throw new RangeError(`month must be 1-12, got ${month}`);
    return days;
  }

  static isValid(date: ISimpleDate): boolean {
    try {
      assertValid(date);
      return true;
    } catch {
      return false;
    }
  }

  static toAd(bs: ISimpleDate): ISimpleDate {
    assertValid(bs);
    const { start, months } = calendarYear(bs.year);
    const days = start + sum(months.slice(0, bs.month - 1)) + bs.day - 1;
    const ad = new Date(EPOCH_UTC + days * DAY_MS);
    return { year: ad.getUTCFullYear(), month: ad.getUTCMonth() + 1, day: ad.getUTCDate() };
  }

  static fromAd(ad: ISimpleDate): ISimpleDate {
    assertInteger("year", ad.year);
    assertInteger("month", ad.month);
    assertInteger("day", ad.day);
    const utc = Date.UTC(ad.year, ad.month - 1, ad.day);
    const check = new Date(utc);
    if (check.getUTCMonth() !== ad.month - 1 || check.getUTCDate() !== ad.day) {
      throw new RangeError(`${ad.year}-${ad.month}-${ad.day} is not a valid AD date`);
    }

    const daysSinceEpoch = (utc - EPOCH_UTC) / DAY_MS;
    let entry: ICalendarYear | undefined;
    for (const year of years) {
      if (year.start > daysSinceEpoch) break;
      entry = year;
    }
    if (!entry || daysSinceEpoch >= totalDays) {
      throw new RangeError(`AD date is outside the supported BS range ${MIN_YEAR}–${MAX_YEAR}`);
    }

    let remaining = daysSinceEpoch - entry.start;
    let month = 1;
    for (const length of entry.months) {
      if (remaining < length) break;
      remaining -= length;
      month++;
    }
    return { year: entry.year, month, day: remaining + 1 };
  }

  /** An AD `YYYY-MM-DD` calendar date, as the API stores it, in BS. */
  static fromAdIso(iso: string): ISimpleDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) throw new RangeError(`Expected an AD date as YYYY-MM-DD, got "${iso}"`);
    return BsDateHelper.fromAd({ year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) });
  }

  static toAdIso(bs: ISimpleDate): string {
    const ad = BsDateHelper.toAd(bs);
    return `${ad.year}-${pad(ad.month)}-${pad(ad.day)}`;
  }

  /** The BS date in Nepal at this instant, whatever the host's timezone. */
  static fromInstant(instant: Date): ISimpleDate {
    const npt = new Date(instant.getTime() + NPT_OFFSET_MS);
    return BsDateHelper.fromAd({
      year: npt.getUTCFullYear(),
      month: npt.getUTCMonth() + 1,
      day: npt.getUTCDate(),
    });
  }

  static today(now: Date = new Date()): ISimpleDate {
    return BsDateHelper.fromInstant(now);
  }

  /** 0 = Sunday … 6 = Saturday. */
  static weekday(bs: ISimpleDate): number {
    const ad = BsDateHelper.toAd(bs);
    return new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay();
  }

  /** Moves by whole BS months, clamping the day to the target month's length. */
  static addMonths(bs: ISimpleDate, months: number): ISimpleDate {
    assertInteger("months", months);
    const index = bs.year * 12 + (bs.month - 1) + months;
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;
    return { year, month, day: Math.min(bs.day, BsDateHelper.daysInMonth(year, month)) };
  }

  static compare(a: ISimpleDate, b: ISimpleDate): number {
    return a.year - b.year || a.month - b.month || a.day - b.day;
  }

  /** Accepts "YYYY-MM-DD". */
  static parse(text: string): ISimpleDate {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text.trim());
    if (!match) throw new RangeError(`Expected a BS date as YYYY-MM-DD, got "${text}"`);
    const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    assertValid(date);
    return date;
  }

  static format(bs: ISimpleDate, style: BsFormatStyle = "iso"): string {
    assertValid(bs);
    const monthName = MONTHS[bs.month - 1];

    switch (style) {
      case "iso":
        return `${bs.year}-${pad(bs.month)}-${pad(bs.day)}`;
      case "long":
        return `${bs.day} ${monthName} ${bs.year}`;
      case "dayMonth":
        return `${bs.day} ${monthName}`;
      case "monthYear":
        return `${monthName} ${bs.year}`;
      default:
        throw new RangeError(`Unknown style "${String(style)}"`);
    }
  }
}
