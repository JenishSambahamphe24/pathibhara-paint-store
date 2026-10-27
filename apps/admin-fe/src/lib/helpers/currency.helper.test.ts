import { describe, expect, test } from "vitest";

import { CurrencyHelper } from "./currency.helper";

describe("CurrencyHelper.formatNpr", () => {
  test("uses lakh grouping and two decimals", () => {
    expect(CurrencyHelper.formatNpr(12345650)).toBe("Rs 1,23,456.50");
  });

  test("shows single paisa", () => {
    expect(CurrencyHelper.formatNpr(5)).toBe("Rs 0.05");
  });

  test("keeps the sign on negative amounts", () => {
    expect(CurrencyHelper.formatNpr(-123450)).toBe("Rs -1,234.50");
  });

  test("renders a dash for missing values", () => {
    expect(CurrencyHelper.formatNpr(null)).toBe("—");
  });
});

describe("CurrencyHelper.formatCompactNpr", () => {
  test("shortens to thousands, lakhs and crores", () => {
    expect(CurrencyHelper.formatCompactNpr(0)).toBe("Rs 0");
    expect(CurrencyHelper.formatCompactNpr(2500000)).toBe("Rs 25K");
    expect(CurrencyHelper.formatCompactNpr(12500000)).toBe("Rs 1.3L");
    expect(CurrencyHelper.formatCompactNpr(2000000000)).toBe("Rs 2Cr");
  });
});
