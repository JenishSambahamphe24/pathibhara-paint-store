import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// The store's business day. Daily sales and batch dates are calendar dates in
// this zone, whatever timezone the admin's browser happens to be in.
export const STORE_TZ = "Asia/Kathmandu";

type TDateInput = string | number | Date | dayjs.Dayjs | null | undefined;

export class DateHelper {
  static format(value: TDateInput, format = "LL"): string {
    if (value === null || value === undefined || value === "") return "—";
    const d = dayjs(value);
    if (!d.isValid()) return "—";
    return d.tz(STORE_TZ).format(format);
  }

  static formatDate(value: TDateInput): string {
    return DateHelper.format(value, "ll");
  }

  static formatDateTime(value: TDateInput): string {
    return DateHelper.format(value, "lll");
  }

  // A `YYYY-MM-DD` calendar date is not an instant; formatting it through a
  // timezone conversion could shift it by a day.
  static formatCalendarDate(value: string | null | undefined): string {
    if (!value) return "—";
    const d = dayjs(value);
    return d.isValid() ? d.format("ll") : "—";
  }

  static todayInStore(): string {
    return dayjs().tz(STORE_TZ).format("YYYY-MM-DD");
  }

  static fromNow(value: TDateInput): string {
    if (value === null || value === undefined || value === "") return "—";
    const d = dayjs(value);
    if (!d.isValid()) return "—";
    return d.fromNow();
  }

  static toDatetimeLocalInput(value: TDateInput): string {
    if (value === null || value === undefined || value === "") return "";
    const d = dayjs(value);
    if (!d.isValid()) return "";
    return d.format("YYYY-MM-DDTHH:mm");
  }

  static fromDatetimeLocalInput(
    value: string | null | undefined,
  ): string | null {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d.toISOString() : null;
  }
}
