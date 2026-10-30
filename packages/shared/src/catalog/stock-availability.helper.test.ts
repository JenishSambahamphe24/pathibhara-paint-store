import { describe, expect, it } from "vitest";

import { StockAvailabilityHelper } from "./stock-availability.helper";

describe("StockAvailabilityHelper", () => {
  it("is ask-in-store with nothing on the shelf", () => {
    expect(StockAvailabilityHelper.of(0, 0)).toBe("askInStore");
    expect(StockAvailabilityHelper.of(0, 5)).toBe("askInStore");
  });

  it("is low at or below the reorder level", () => {
    expect(StockAvailabilityHelper.of(5, 5)).toBe("lowStock");
    expect(StockAvailabilityHelper.of(1, 5)).toBe("lowStock");
  });

  it("is in stock above the reorder level", () => {
    expect(StockAvailabilityHelper.of(6, 5)).toBe("inStock");
    expect(StockAvailabilityHelper.of(1, 0)).toBe("inStock");
  });
});
