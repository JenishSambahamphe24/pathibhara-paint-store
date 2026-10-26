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
