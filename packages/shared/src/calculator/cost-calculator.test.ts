import type { ICalculatorProduct } from "./cost-calculator";

import { describe, expect, it } from "vitest";

import { costEstimateInputSchema } from "./calculator.schemas";
import { ContainerPlanner } from "./container-planner";
import { CalculatorError, CostCalculator } from "./cost-calculator";

const sizes = (...litres: Array<number>) =>
  litres.map((l) => ({ id: `${l}L`, volumeMl: Math.round(l * 1000), pricePaisa: Math.round(l * 40000), isActive: true }));

function plan(requiredMl: number, litres: Array<number>) {
  return ContainerPlanner.plan(requiredMl, sizes(...litres)).containers.map(
    (c) => `${c.count}x${c.size.volumeMl / 1000}L`,
  );
}

describe("ContainerPlanner", () => {
  it("16 L takes the largest cans first, not four 4 L", () => {
    expect(plan(16000, [1, 4, 10, 20])).toEqual(["1x10L", "1x4L", "2x1L"]);
  });

  it("21 L is one 20 L and one 1 L", () => {
    expect(plan(21000, [1, 4, 10, 20])).toEqual(["1x20L", "1x1L"]);
  });

  it("uses 0.5 L enamel tins", () => {
    expect(plan(1500, [0.5, 1, 4])).toEqual(["1x1L", "1x0.5L"]);
  });

  it("an exact single can needs nothing else", () => {
    expect(plan(20000, [1, 4, 10, 20])).toEqual(["1x20L"]);
  });

  it("without a 1 L size, picks the least overshoot", () => {
    // 13 L from 4/10/20: greedy 10 + 4 overshoots by 1 L; 4 x 4 = 16 is worse.
    const result = ContainerPlanner.plan(13000, sizes(4, 10, 20));
    expect(result.overshootMl).toBe(1000);
    expect(result.containers.map((c) => `${c.count}x${c.size.volumeMl / 1000}L`)).toEqual(["1x10L", "1x4L"]);
  });

  it("ties on overshoot go to fewer cans", () => {
    // 12 L from 4/10: 3 x 4 = 12 exactly beats any overshoot, even with more cans.
    expect(plan(12000, [4, 10])).toEqual(["3x4L"]);
    // 20 L from 4/10: 2 x 10 and 5 x 4 are both exact; greedy already picks 2 x 10.
    expect(plan(20000, [4, 10])).toEqual(["2x10L"]);
  });

  it("exact beats overshoot even when greedy misses it", () => {
    // 8 L from 4/6: greedy takes 6 and is stuck at 2 L; 2 x 4 is exact.
    expect(plan(8000, [4, 6])).toEqual(["2x4L"]);
  });

  it("prefers larger cans between equally good answers", () => {
    // 11 L from 3/4/5: greedy 5 + 5 can't finish. 5 + 3 + 3 and 4 + 4 + 3 are
    // both exact with three cans; the larger first can wins.
    expect(plan(11000, [3, 4, 5])).toEqual(["1x5L", "2x3L"]);
  });
});

const tractor: ICalculatorProduct = {
  id: "tractor",
  name: "Tractor Emulsion",
  coverageSqftPerLitre: 20,
  variants: [...sizes(1, 4, 10, 20)].map((s) => ({ ...s, currentStock: 3 })),
};
const primer: ICalculatorProduct = {
  id: "primer",
  name: "Damp-proof Primer",
  coverageSqftPerLitre: 12,
  variants: sizes(4, 10, 20),
};
const catalogue = new Map([
  [tractor.id, tractor],
  [primer.id, primer],
]);

const walls = (count: number, side = 12) => [{ label: null, widthFt: side, heightFt: side, quantity: count }];

describe("CostCalculator.estimate", () => {
  it("works out area, litres, cans and cost per product and section", () => {
    // 4 walls of 12 x 12 = 576 sq ft, minus 2 doors of 3 x 7 = 42 -> 534 sq ft.
    // 2 coats at 20 sq ft/L = 53.4 L -> 54 L -> 2 x 20 + 1 x 10 + 1 x 4.
    const result = CostCalculator.estimate(
      {
        wastagePercent: 0,
        sections: [
          {
            name: "Interior",
            surfaces: walls(4),
            deductions: [{ label: "Door", widthFt: 3, heightFt: 7, quantity: 2 }],
            products: [{ productId: "tractor", coats: 2 }],
          },
        ],
      },
      catalogue,
    );
    const [section] = result.sections;
    expect(section.netAreaSqft).toBe(534);
    const [line] = section.products;
    expect(line.requiredMl).toBe(53400);
    expect(line.roundedMl).toBe(54000);
    expect(line.containers.map((c) => [c.volumeMl, c.count])).toEqual([
      [20000, 2],
      [10000, 1],
      [4000, 1],
    ]);
    expect(line.costPaisa).toBe(2 * 800000 + 400000 + 160000);
    expect(section.subtotalPaisa).toBe(line.costPaisa);
    expect(result.totalPaisa).toBe(line.costPaisa);
  });

  it("adds wastage before rounding to can sizes", () => {
    // 200 sq ft, 2 coats, 20 sq ft/L = 20 L; +10% = 22 L -> 20 + 1 + 1.
    const result = CostCalculator.estimate(
      {
        wastagePercent: 10,
        sections: [{ name: "Room", surfaces: [{ label: null, widthFt: 20, heightFt: 10, quantity: 1 }], deductions: [], products: [{ productId: "tractor", coats: 2 }] }],
      },
      catalogue,
    );
    const [line] = result.sections[0].products;
    expect(line.requiredMl).toBe(22000);
    expect(line.containers.map((c) => [c.volumeMl, c.count])).toEqual([
      [20000, 1],
      [1000, 2],
    ]);
  });

  it("rounds up to the smallest size when there is no 1 L can", () => {
    // 130 sq ft, 1 coat, 12 sq ft/L = 10.84 L -> rounded to 12 L (a multiple
    // of the 4 L minimum) -> 3 x 4 L.
    const one = CostCalculator.estimate(
      { wastagePercent: 0, sections: [{ name: "Ext", surfaces: [{ label: null, widthFt: 13, heightFt: 10, quantity: 1 }], deductions: [], products: [{ productId: "primer", coats: 1 }] }] },
      catalogue,
    );
    const [line] = one.sections[0].products;
    expect(line.roundedMl).toBe(12000);
    expect(line.containers.map((c) => [c.volumeMl, c.count])).toEqual([[4000, 3]]);
    expect(line.overshootMl).toBe(12000 - line.requiredMl);
  });

  it("flags cans the shop doesn't have enough of", () => {
    const result = CostCalculator.estimate(
      { wastagePercent: 0, sections: [{ name: "Big", surfaces: walls(10), deductions: [], products: [{ productId: "tractor", coats: 2 }] }] },
      catalogue,
    );
    const [line] = result.sections[0].products;
    // 10 walls of 12 x 12 = 1440 sq ft x 2 coats / 20 = 144 L -> 7 x 20 + 4; stock is 3 each.
    expect(line.containers[0]).toMatchObject({ volumeMl: 20000, count: 7, isShort: true });
    expect(result.hasStockShortage).toBe(true);
  });

  it("refuses a product with no active sizes", () => {
    const inactive = new Map([[primer.id, { ...primer, variants: primer.variants.map((v) => ({ ...v, isActive: false })) }]]);
    expect(() =>
      CostCalculator.estimate(
        { wastagePercent: 0, sections: [{ name: "X", surfaces: walls(1), deductions: [], products: [{ productId: "primer", coats: 1 }] }] },
        inactive,
      ),
    ).toThrow(CalculatorError);
  });
});

describe("costEstimateInputSchema", () => {
  const section = {
    name: "Interior",
    surfaces: walls(1, 10),
    deductions: [],
    products: [{ productId: "0198f0c2-0000-7000-8000-000000000001", coats: 2 }],
  };

  it("rejects zero and negative sizes", () => {
    const zero = costEstimateInputSchema.safeParse({
      wastagePercent: 0,
      sections: [{ ...section, surfaces: [{ label: null, widthFt: 0, heightFt: 10, quantity: 1 }] }],
    });
    const negative = costEstimateInputSchema.safeParse({
      wastagePercent: 0,
      sections: [{ ...section, surfaces: [{ label: null, widthFt: -4, heightFt: 10, quantity: 1 }] }],
    });
    expect(zero.success).toBe(false);
    expect(negative.success).toBe(false);
  });

  it("rejects deductions as large as the walls", () => {
    const result = costEstimateInputSchema.safeParse({
      wastagePercent: 0,
      sections: [{ ...section, deductions: [{ label: "Huge window", widthFt: 10, heightFt: 10, quantity: 1 }] }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["sections", 0, "deductions"]);
  });

  it("accepts a normal estimate", () => {
    expect(costEstimateInputSchema.safeParse({ wastagePercent: 10, sections: [section] }).success).toBe(true);
  });
});
