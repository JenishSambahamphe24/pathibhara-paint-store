import type { IPublicVariant } from "../types";

import { describe, expect, test } from "vitest";

import { ProductHelper } from "./product.helper";

function variant(volumeMl: number, pricePaisa: number): IPublicVariant {
  return {
    id: String(volumeMl),
    volumeMl,
    pricePaisa,
    availability: "inStock",
  };
}

const oneLitre = variant(1000, 145000);

describe("ProductHelper.savingPaisa", () => {
  test("compares a big can with the same paint in the smallest cans", () => {
    expect(ProductHelper.savingPaisa(variant(18000, 2295000), oneLitre)).toBe(
      18 * 145000 - 2295000,
    );
  });

  test("has nothing to say about the smallest can or an uneven size", () => {
    expect(ProductHelper.savingPaisa(oneLitre, oneLitre)).toBeNull();
    expect(
      ProductHelper.savingPaisa(variant(10000, 1320000), variant(4000, 548000)),
    ).toBeNull();
  });

  test("doesn't claim a saving when the big can costs more per litre", () => {
    expect(
      ProductHelper.savingPaisa(variant(4000, 600000), oneLitre),
    ).toBeNull();
  });
});

describe("ProductHelper.wallSideFt", () => {
  test("turns coverage into the side of a square wall", () => {
    expect(ProductHelper.wallSideFt(35)).toBe(6);
    expect(ProductHelper.wallSideFt(120)).toBe(11);
  });
});
