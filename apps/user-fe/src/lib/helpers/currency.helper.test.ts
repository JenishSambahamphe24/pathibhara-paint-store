import { describe, expect, test } from "vitest";

import { CurrencyHelper } from "./currency.helper";

describe("CurrencyHelper.formatNpr", () => {
  test("uses lakh grouping and drops zero paisa", () => {
    expect(CurrencyHelper.formatNpr(12500000)).toBe("Rs. 1,25,000");
  });

  test("shows paisa when there are any", () => {
    expect(CurrencyHelper.formatNpr(125050)).toBe("Rs. 1,250.50");
  });

  test("puts the sign before the currency", () => {
    expect(CurrencyHelper.formatNpr(-50000)).toBe("-Rs. 500");
  });
});

describe("CurrencyHelper.formatPerLitre", () => {
  test("divides by litres from ml and rounds to whole paisa", () => {
    expect(CurrencyHelper.formatPerLitre(2295000, 18000)).toBe("Rs. 1,275 / L");
    expect(CurrencyHelper.formatPerLitre(100000, 3000)).toBe("Rs. 333.33 / L");
  });
});
