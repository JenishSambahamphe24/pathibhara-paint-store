import { describe, expect, it } from "vitest";

import { MoneyHelper, paisaSchema } from "./money.helper";

describe("MoneyHelper.parseRupees", () => {
  it("parses whole and fractional rupees exactly", () => {
    expect(MoneyHelper.parseRupees("1250")).toBe(125000);
    expect(MoneyHelper.parseRupees("1,250.5")).toBe(125050);
    expect(MoneyHelper.parseRupees("0.29")).toBe(29);
  });

  it("rejects more than two decimals, negatives and junk", () => {
    expect(MoneyHelper.parseRupees("1.234")).toBeNull();
    expect(MoneyHelper.parseRupees("-5")).toBeNull();
    expect(MoneyHelper.parseRupees("abc")).toBeNull();
    expect(MoneyHelper.parseRupees("")).toBeNull();
  });
});

describe("MoneyHelper.toRupeesString", () => {
  it("always shows two decimals", () => {
    expect(MoneyHelper.toRupeesString(125050)).toBe("1250.50");
    expect(MoneyHelper.toRupeesString(5)).toBe("0.05");
    expect(MoneyHelper.toRupeesString(-150)).toBe("-1.50");
  });

  it("round-trips with parseRupees", () => {
    expect(MoneyHelper.parseRupees(MoneyHelper.toRupeesString(98765))).toBe(98765);
  });
});

describe("MoneyHelper.multiply", () => {
  it("multiplies and guards against overflow", () => {
    expect(MoneyHelper.multiply(125050, 3)).toBe(375150);
    expect(() => MoneyHelper.multiply(Number.MAX_SAFE_INTEGER, 2)).toThrow(RangeError);
  });
});

describe("paisaSchema", () => {
  it("accepts whole non-negative paisa only", () => {
    expect(paisaSchema.safeParse(100).success).toBe(true);
    expect(paisaSchema.safeParse(1.5).success).toBe(false);
    expect(paisaSchema.safeParse(-1).success).toBe(false);
  });
});
