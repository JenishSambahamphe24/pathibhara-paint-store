// The store's calendar. Batch receipt dates and daily sales dates are days in
// this zone, regardless of where the server or the admin's browser runs.
export const STORE_TIMEZONE = "Asia/Kathmandu";

export class StoreDateHelper {
  static today(now: Date = new Date()): string {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: STORE_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }

  static isFuture(date: string, now: Date = new Date()): boolean {
    return date > StoreDateHelper.today(now);
  }

  // Calendar arithmetic on a YYYY-MM-DD day. Done in UTC so no DST or
  // offset can shift the result by a day.
  static addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }
}
