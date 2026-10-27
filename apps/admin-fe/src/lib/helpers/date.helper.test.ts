import { describe, expect, test } from "vitest";

import { DateHelper } from "./date.helper";

describe("DateHelper", () => {
  test("shows instants as the Bikram Sambat day in Nepal", () => {
    // 18:30 UTC on 26 Oct 2026 is 00:15 on 27 Oct (10 Kartik 2083) in Kathmandu.
    expect(DateHelper.formatDate("2026-10-26T18:30:00.000Z")).toBe(
      "10 Kartik 2083",
    );
    expect(DateHelper.formatDateTime("2026-10-26T18:30:00.000Z")).toBe(
      "10 Kartik 2083, 12:15 AM",
    );
  });

  test("converts calendar dates without shifting the day", () => {
    expect(DateHelper.formatCalendarDate("2026-10-27")).toBe("10 Kartik 2083");
    expect(DateHelper.formatCalendarDate("2026-10-27", "dayMonth")).toBe(
      "10 Kartik",
    );
    expect(DateHelper.formatCalendarDateWithWeekday("2026-10-27")).toBe(
      "Tue, 10 Kartik 2083",
    );
  });

  test("shows a dash for missing or unreadable dates", () => {
    expect(DateHelper.formatDate(null)).toBe("—");
    expect(DateHelper.formatCalendarDate("")).toBe("—");
    expect(DateHelper.formatCalendarDate("2026-02-30")).toBe("—");
  });
});
