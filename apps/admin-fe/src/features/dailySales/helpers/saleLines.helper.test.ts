import type { IDailySaleDetail } from "../types";

import { describe, expect, test } from "vitest";

import { SaleLinesHelper } from "./saleLines.helper";

const saved: IDailySaleDetail = {
  id: "s",
  saleDate: "2026-10-21",
  lineCount: 1,
  units: 5,
  revenuePaisa: 225000,
  updatedByName: "A",
  updatedAt: "",
  notes: null,
  createdByName: "A",
  createdAt: "",
  items: [
    {
      id: "i",
      variantId: "v1",
      productId: "p",
      productName: "Paint",
      volumeMl: 1000,
      sku: "P-1",
      quantity: 5,
      unitPricePaisa: 45000,
      currentStock: 3,
    },
  ],
};

describe("SaleLinesHelper", () => {
  test("a saved line can use the stock it already took", () => {
    expect(SaleLinesHelper.infoFromSaved(saved).get("v1")).toEqual({
      label: "Paint · 1 L",
      unitPricePaisa: 45000,
      available: 8,
    });
  });

  test("totals skip incomplete lines and use integer paisa", () => {
    const info = SaleLinesHelper.infoFromSaved(saved);
    expect(
      SaleLinesHelper.totals(
        [
          { variantId: "v1", quantity: 3 },
          { variantId: "", quantity: 2 },
          { variantId: "v1", quantity: null },
        ],
        info,
      ),
    ).toEqual({ units: 3, revenuePaisa: 135000 });
  });
});
