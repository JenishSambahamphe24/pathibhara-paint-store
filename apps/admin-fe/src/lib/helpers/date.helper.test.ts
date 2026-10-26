import { describe, expect, test } from "vitest";

import { DateHelper } from "./date.helper";

describe("DateHelper", () => {
  test("formats instants in the store timezone", () => {
    // 18:30 UTC is 00:15 the next day in Kathmandu (UTC+5:45).
    expect(
      DateHelper.format("2026-10-25T18:30:00.000Z", "YYYY-MM-DD HH:mm"),
    ).toBe("2026-10-26 00:15");
  });

  test("leaves calendar dates on their own day", () => {
    expect(DateHelper.formatCalendarDate("2026-10-26")).toBe("Oct 26, 2026");
  });
});
