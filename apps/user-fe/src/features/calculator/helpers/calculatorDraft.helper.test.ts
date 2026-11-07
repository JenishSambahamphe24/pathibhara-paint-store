import type { IPublicProductListItem } from "#/features/catalog/types";

import { describe, expect, test } from "vitest";

import { CalculatorDraftHelper } from "./calculatorDraft.helper";

function product(
  id: string,
  name: string,
  category: string,
  defaultCoats = 2,
): IPublicProductListItem {
  return {
    id,
    slug: id,
    name,
    category: { slug: category.toLowerCase(), name: category },
    coverImage: null,
    minPricePaisa: 100000,
    maxPricePaisa: 200000,
    variantCount: 2,
    volumesMl: [1000, 4000],
    defaultCoats,
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

const catalogue = [
  product("ext-primer", "Ultima Basecoat", "Exterior primer", 1),
  product("int-primer", "Wall Primer", "Interior primer", 1),
  product("ext-emulsion", "Apex Weather", "Exterior emulsion"),
  product("int-emulsion", "Royale Luxury", "Interior emulsion"),
];

const PRODUCT_ID = "3f0c2a7e-8b1d-4c5a-9e6f-1a2b3c4d5e6f";

describe("CalculatorDraftHelper.defaultProducts", () => {
  test("picks a primer and a finish that suit the section", () => {
    expect(
      CalculatorDraftHelper.defaultProducts(catalogue, "interior").map(
        (item) => item.id,
      ),
    ).toEqual(["int-primer", "int-emulsion"]);
    expect(
      CalculatorDraftHelper.defaultProducts(catalogue, "exterior").map(
        (item) => item.id,
      ),
    ).toEqual(["ext-primer", "ext-emulsion"]);
  });
});

describe("CalculatorDraftHelper.preset", () => {
  test("a room turns on Interior only, with each product's usual coats", () => {
    const [interior, exterior] = CalculatorDraftHelper.preset(
      "room",
      catalogue,
    );

    expect(interior.isOn).toBe(true);
    expect(exterior.isOn).toBe(false);
    expect(interior.products.map((row) => row.coats)).toEqual([1, 2]);
    expect(CalculatorDraftHelper.netArea(interior)).toBe(560 - 53);
  });

  test("is the same on every build, so SSR and the browser agree", () => {
    expect(CalculatorDraftHelper.preset("room", catalogue)).toEqual(
      CalculatorDraftHelper.preset("room", catalogue),
    );
  });

  test("starts the exterior with the products it was opened with", () => {
    const [, exterior] = CalculatorDraftHelper.preset("exterior", catalogue, [
      catalogue[3],
    ]);

    expect(exterior.products.map((row) => row.productId)).toEqual([
      "int-emulsion",
    ]);
  });
});

describe("CalculatorDraftHelper.toInput", () => {
  const section = {
    key: "interior" as const,
    name: "Interior",
    isOn: true,
    surfaces: [
      { id: "a", label: "Wall", width: "12", height: "10", quantity: 2 },
      { id: "b", label: "Being typed", width: "12.", height: "", quantity: 1 },
    ],
    deductions: [],
    products: [{ id: "p", productId: PRODUCT_ID, coats: 2 }],
  };

  test("skips rows still being typed and sends the rest", () => {
    const { input, problems } = CalculatorDraftHelper.toInput([section], 10);

    expect(problems).toEqual({});
    expect(input?.sections[0].surfaces).toEqual([
      { label: "Wall", widthFt: 12, heightFt: 10, quantity: 2 },
    ]);
  });

  test("leaves a section out with the reason when it can't be priced", () => {
    const covered = {
      ...section,
      deductions: [
        { id: "d", label: "Glass", width: "20", height: "20", quantity: 1 },
      ],
    };

    const { input, problems } = CalculatorDraftHelper.toInput([covered], 10);

    expect(input).toBeNull();
    expect(problems.interior).toBe(
      "Doors and windows can't cover the whole wall area",
    );
  });
});

describe("CalculatorDraftHelper.summary", () => {
  test("lists each product's cans and price, then the total", () => {
    const text = CalculatorDraftHelper.summary(
      {
        wastagePercent: 10,
        totalPaisa: 2450000,
        sections: [
          {
            name: "Interior",
            grossAreaSqft: 560,
            deductionAreaSqft: 53,
            netAreaSqft: 507,
            subtotalPaisa: 2450000,
            products: [
              {
                productId: PRODUCT_ID,
                name: "Royale Luxury",
                coats: 2,
                coverageSqftPerLitre: 120,
                areaSqft: 507,
                requiredMl: 9300,
                purchasedMl: 10000,
                costPaisa: 2450000,
                containers: [
                  {
                    variantId: PRODUCT_ID,
                    volumeMl: 10000,
                    count: 1,
                    unitPricePaisa: 2450000,
                    lineTotalPaisa: 2450000,
                  },
                ],
              },
            ],
          },
        ],
      },
      "https://example.com/calculator",
    );

    expect(text).toContain("Interior: 507 sq ft to paint");
    expect(text).toContain("- Royale Luxury, 2 coats: 1 × 10 L (Rs. 24,500)");
    expect(text).toContain("Total: Rs. 24,500");
  });
});

describe("CalculatorDraftHelper.wallsMessage", () => {
  test("lists the sized walls and openings of the sections that are on", () => {
    const [interior, exterior] = CalculatorDraftHelper.preset(
      "room",
      catalogue,
    );

    const text = CalculatorDraftHelper.wallsMessage([interior, exterior]);

    expect(text).toContain("Interior walls:\n- Long walls: 12 × 10 ft × 2");
    expect(text).toContain("Doors and windows:\n- Door: 3 × 7 ft × 1");
    expect(text).not.toContain("Exterior");
  });
});
