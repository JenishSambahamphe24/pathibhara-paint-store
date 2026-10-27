import { describe, expect, it } from "vitest";

import { BsDateHelper } from "./bs-date.helper";
import { NumeralHelper } from "./numeral.helper";

const DAY_MS = 86_400_000;

describe("BsDateHelper", () => {
  it("maps known anchors", () => {
    expect(BsDateHelper.toAd({ year: 2000, month: 1, day: 1 })).toEqual({ year: 1943, month: 4, day: 14 });
    expect(BsDateHelper.toAdIso({ year: 2083, month: 1, day: 1 })).toBe("2026-04-14");
    expect(BsDateHelper.fromAdIso("2026-10-27")).toEqual({ year: 2083, month: 7, day: 10 });
  });

  // The table itself was cross-checked against ward-sewa's helper (and through
  // it nepali-date-converter) when it was copied; this guards the conversion code.
  it("round-trips every day in the supported range", () => {
    let checked = 0;
    for (let t = Date.UTC(1943, 3, 14); ; t += DAY_MS) {
      const d = new Date(t);
      const ad = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
      let bs;
      try {
        bs = BsDateHelper.fromAd(ad);
      } catch {
        break;
      }
      expect(BsDateHelper.toAd(bs)).toEqual(ad);
      checked++;
    }
    expect(checked).toBeGreaterThan(33_000);
  });

  it("uses Nepal's day, not the host's, for an instant", () => {
    // 18:15 UTC is midnight in Nepal (UTC+05:45).
    expect(BsDateHelper.fromInstant(new Date("2026-10-26T18:14:59Z"))).toEqual({ year: 2083, month: 7, day: 9 });
    expect(BsDateHelper.fromInstant(new Date("2026-10-26T18:15:00Z"))).toEqual({ year: 2083, month: 7, day: 10 });
  });

  it("rejects impossible or out-of-range dates instead of rolling them over", () => {
    expect(() => BsDateHelper.toAd({ year: 2083, month: 8, day: 30 })).toThrow(/has 29 days/);
    expect(() => BsDateHelper.toAd({ year: 2083, month: 13, day: 1 })).toThrow(RangeError);
    expect(() => BsDateHelper.fromAdIso("2026-02-30")).toThrow(/not a valid AD date/);
    expect(() => BsDateHelper.fromAdIso("26-10-27")).toThrow(RangeError);
    expect(() => BsDateHelper.fromAd({ year: 1943, month: 4, day: 13 })).toThrow(RangeError);
    expect(BsDateHelper.isValid({ year: 2083, month: 8, day: 29 })).toBe(true);
    expect(BsDateHelper.isValid({ year: 2083, month: 8, day: 30 })).toBe(false);
  });

  it("formats in English and Nepali", () => {
    const date = { year: 2083, month: 7, day: 10 };
    expect(BsDateHelper.format(date)).toBe("2083-07-10");
    expect(BsDateHelper.format(date, { style: "long" })).toBe("10 Kartik 2083");
    expect(BsDateHelper.format(date, { style: "dayMonth" })).toBe("10 Kartik");
    expect(BsDateHelper.format(date, { style: "monthYear" })).toBe("Kartik 2083");
    expect(BsDateHelper.format(date, { locale: "ne", style: "long" })).toBe("२०८३ कार्तिक १०");
    expect(BsDateHelper.format(date, { locale: "ne" })).toBe("२०८३-०७-१०");
  });

  it("parses ASCII and Devanagari digits", () => {
    expect(BsDateHelper.parse("२०८३-७-१०")).toEqual({ year: 2083, month: 7, day: 10 });
    expect(() => BsDateHelper.parse("2083/07/10")).toThrow(RangeError);
  });

  it("knows the weekday", () => {
    expect(BsDateHelper.weekday({ year: 2083, month: 7, day: 10 })).toBe(2);
  });

  it("adds months across years, clamping the day", () => {
    expect(BsDateHelper.addMonths({ year: 2083, month: 12, day: 15 }, 1)).toEqual({ year: 2084, month: 1, day: 15 });
    expect(BsDateHelper.addMonths({ year: 2083, month: 1, day: 5 }, -1)).toEqual({ year: 2082, month: 12, day: 5 });
    // Kartik 2083 has 30 days, Mangsir 29.
    expect(BsDateHelper.addMonths({ year: 2083, month: 7, day: 30 }, 1)).toEqual({ year: 2083, month: 8, day: 29 });
    expect(BsDateHelper.compare({ year: 2083, month: 6, day: 30 }, { year: 2083, month: 7, day: 1 })).toBeLessThan(0);
  });
});

describe("NumeralHelper", () => {
  it("converts digits both ways", () => {
    expect(NumeralHelper.toNepali("2083-07-10")).toBe("२०८३-०७-१०");
    expect(NumeralHelper.toEnglish("२०८३")).toBe("2083");
  });
});
