import type { BsFormatStyle } from "@repo/shared";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { BsDateHelper } from "@repo/shared";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// The store's business day. Daily sales and batch dates are calendar dates in
// this zone, whatever timezone the admin's browser happens to be in.
export const STORE_TZ = "Asia/Kathmandu";

type TDateInput = string | number | Date | dayjs.Dayjs | null | undefined;

// Every date is shown in Bikram Sambat. The API stores and sends AD (instants
// and YYYY-MM-DD calendar dates); conversion happens only here and in the
// BS pickers.
export class DateHelper {
  static formatDate(value: TDateInput): string {
    const d = DateHelper.parseInstant(value);
    if (!d) return "—";
    return BsDateHelper.format(BsDateHelper.fromInstant(d.toDate()), "long");
  }

  static formatDateTime(value: TDateInput): string {
    const d = DateHelper.parseInstant(value);
    if (!d) return "—";
    return `${DateHelper.formatDate(d)}, ${d.tz(STORE_TZ).format("h:mm A")}`;
  }

  // A `YYYY-MM-DD` calendar date is not an instant; formatting it through a
  // timezone conversion could shift it by a day.
  static formatCalendarDate(
    value: string | null | undefined,
    style: BsFormatStyle = "long",
  ): string {
    if (!value) return "—";
    try {
      return BsDateHelper.format(BsDateHelper.fromAdIso(value), style);
    } catch {
      return "—";
    }
  }

  static formatCalendarDateWithWeekday(value: string): string {
    const bs = BsDateHelper.fromAdIso(value);
    return `${BsDateHelper.WEEKDAYS[BsDateHelper.weekday(bs)]}, ${BsDateHelper.format(bs, "long")}`;
  }

  // Plain calendar arithmetic on YYYY-MM-DD, done in UTC so no zone or DST
  // shift can land on the wrong day.
  static shiftCalendarDate(date: string, days: number): string {
    return dayjs.utc(date).add(days, "day").format("YYYY-MM-DD");
  }

  static todayInStore(): string {
    return dayjs().tz(STORE_TZ).format("YYYY-MM-DD");
  }

  static fromNow(value: TDateInput): string {
    const d = DateHelper.parseInstant(value);
    return d ? d.fromNow() : "—";
  }

  static toDatetimeLocalInput(value: TDateInput): string {
    const d = DateHelper.parseInstant(value);
    return d ? d.format("YYYY-MM-DDTHH:mm") : "";
  }

  static fromDatetimeLocalInput(
    value: string | null | undefined,
  ): string | null {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d.toISOString() : null;
  }

  private static parseInstant(value: TDateInput): dayjs.Dayjs | null {
    if (value === null || value === undefined || value === "") return null;
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }
}
