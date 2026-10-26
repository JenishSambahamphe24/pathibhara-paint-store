import { describe, expect, it } from "vitest";

import { StoreDateHelper } from "./store-date.helper";

describe("StoreDateHelper", () => {
  it("uses the Kathmandu calendar day, not UTC", () => {
    // 18:30 UTC on the 25th is 00:15 on the 26th in Kathmandu (UTC+5:45).
    expect(StoreDateHelper.today(new Date("2026-10-25T18:30:00Z"))).toBe("2026-10-26");
    expect(StoreDateHelper.today(new Date("2026-10-25T18:00:00Z"))).toBe("2026-10-25");
  });

  it("flags dates after today as future", () => {
    const now = new Date("2026-10-26T06:00:00Z");
    expect(StoreDateHelper.isFuture("2026-10-27", now)).toBe(true);
    expect(StoreDateHelper.isFuture("2026-10-26", now)).toBe(false);
  });
});
