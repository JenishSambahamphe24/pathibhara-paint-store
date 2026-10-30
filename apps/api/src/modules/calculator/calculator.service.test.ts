import type { CalculatorRepository } from "./calculator.repository";

import { describe, expect, it } from "vitest";

import { ValidationException } from "@repo/http-kit";
import { costEstimateInputSchema } from "@repo/shared";

import { CalculatorService } from "./calculator.service";

const PRODUCT_ID = "0190a000-0000-7000-8000-000000000001";

function variant(variantId: string, volumeMl: number, pricePaisa: number, isActive = true) {
  return {
    id: PRODUCT_ID,
    name: "Silk",
    coverageSqftPerLitre: 100,
    variantId,
    volumeMl,
    pricePaisa,
    isActive,
    currentStock: 0,
  };
}

class FakeCalculatorRepository {
  options: unknown;
  rows = [
    variant("0190a000-0000-7000-8000-0000000000a1", 1000, 50000),
    variant("0190a000-0000-7000-8000-0000000000a2", 4000, 1, false),
  ];

  findProducts(_ids: Array<string>, options?: unknown) {
    this.options = options;
    return Promise.resolve(this.rows);
  }
}

const input = costEstimateInputSchema.parse({
  wastagePercent: 0,
  sections: [
    {
      name: "Room",
      surfaces: [{ label: "Wall", widthFt: 10, heightFt: 20, quantity: 1 }],
      deductions: [],
      products: [{ productId: PRODUCT_ID, coats: 1 }],
    },
  ],
});

describe("CalculatorService.estimatePublic", () => {
  it("asks for public products only and returns no stock data", async () => {
    const repository = new FakeCalculatorRepository();
    const result = await new CalculatorService(
      repository as unknown as CalculatorRepository,
    ).estimatePublic(input);

    expect(repository.options).toEqual({ publicOnly: true });
    expect(result).not.toHaveProperty("hasStockShortage");
    const line = result.sections[0].products[0];
    expect(line).not.toHaveProperty("hasStockShortage");
    expect(line.containers).toEqual([
      {
        variantId: "0190a000-0000-7000-8000-0000000000a1",
        volumeMl: 1000,
        count: 2,
        unitPricePaisa: 50000,
        lineTotalPaisa: 100000,
      },
    ]);
    expect(result.totalPaisa).toBe(100000);
  });

  it("still flags shortages on the admin estimate", async () => {
    const result = await new CalculatorService(
      new FakeCalculatorRepository() as unknown as CalculatorRepository,
    ).estimate(input);
    expect(result.hasStockShortage).toBe(true);
    expect(result.sections[0].products[0].containers[0]).toMatchObject({
      currentStock: 0,
      isShort: true,
    });
  });

  it("reports a product the public catalogue doesn't have as not found", async () => {
    const repository = new FakeCalculatorRepository();
    repository.rows = [];
    await expect(
      new CalculatorService(repository as unknown as CalculatorRepository).estimatePublic(input),
    ).rejects.toBeInstanceOf(ValidationException);
  });
});
