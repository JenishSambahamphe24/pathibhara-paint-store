import type { ProductRepository } from "../product/product.repository";
import type { ShadeRepository } from "./shade.repository";

import { describe, expect, it } from "vitest";

import { publicShadeListQuerySchema } from "@repo/shared";

import { PublicShadeService } from "./public-shade.service";

const VISIBLE = "0190a000-0000-7000-8000-000000000001";
const HIDDEN = "0190a000-0000-7000-8000-000000000002";

function shade(code: string, productId: string | null) {
  return {
    shade: { code, name: code, hex: "#aabbcc", productId },
    productName: null,
    colourSetCount: 0,
  };
}

class FakeShadeRepository {
  listQuery: unknown;

  list(query: unknown) {
    this.listQuery = query;
    return Promise.resolve({
      rows: [shade("A", VISIBLE), shade("B", HIDDEN), shade("C", null)],
      total: 3,
    });
  }
}

class FakeProductRepository {
  requested: Array<string> = [];

  findPublicSummaries(ids: Array<string>) {
    this.requested = ids;
    return Promise.resolve(
      ids.filter((id) => id === VISIBLE).map((id) => ({ id, slug: "silk", name: "Silk" })),
    );
  }
}

describe("PublicShadeService", () => {
  it("lists only active shades and drops links to hidden products", async () => {
    const shades = new FakeShadeRepository();
    const products = new FakeProductRepository();
    const service = new PublicShadeService(
      shades as unknown as ShadeRepository,
      products as unknown as ProductRepository,
    );

    const { items } = await service.list(publicShadeListQuerySchema.parse({}));

    expect(shades.listQuery).toMatchObject({ status: "active" });
    expect(products.requested).toEqual([VISIBLE, HIDDEN]);
    expect(items.map((s) => [s.code, s.product])).toEqual([
      ["A", { slug: "silk", name: "Silk" }],
      ["B", null],
      ["C", null],
    ]);
  });
});
