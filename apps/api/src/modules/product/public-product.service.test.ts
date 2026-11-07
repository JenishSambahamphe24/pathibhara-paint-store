import type { PublicCategoryService } from "../category/public-category.service";
import type { FileService } from "../file/file.service";
import type { ShadeRepository } from "../shade/shade.repository";
import type { ProductRepository } from "./product.repository";

import { describe, expect, it } from "vitest";

import { NotFoundException } from "@repo/http-kit";

import { PublicProductService } from "./public-product.service";

const PRODUCT_ID = "0190a000-0000-7000-8000-000000000001";
const NOW = new Date("2026-01-01T00:00:00Z");

class FakeProductRepository {
  found = true;

  findPublicBySlug(slug: string) {
    if (!this.found) return Promise.resolve(undefined);
    return Promise.resolve({
      product: {
        id: PRODUCT_ID,
        categoryId: "0190a000-0000-7000-8000-0000000000c1",
        slug,
        name: "Silk",
        description: null,
        seoTitle: "Silk emulsion",
        seoDescription: null,
        coverageSqftPerLitre: 120.5,
        defaultCoats: 2,
        isActive: true,
        createdAt: NOW,
        updatedAt: NOW,
      },
      categorySlug: "emulsion",
      categoryName: "Emulsion",
    });
  }

  findActiveVariants() {
    return Promise.resolve([
      {
        id: "0190a000-0000-7000-8000-0000000000a1",
        volumeMl: 1000,
        pricePaisa: 50000,
        currentStock: 0,
        reorderLevel: 2,
      },
      {
        id: "0190a000-0000-7000-8000-0000000000a2",
        volumeMl: 4000,
        pricePaisa: 180000,
        currentStock: 2,
        reorderLevel: 2,
      },
      {
        id: "0190a000-0000-7000-8000-0000000000a3",
        volumeMl: 20000,
        pricePaisa: 800000,
        currentStock: 40,
        reorderLevel: 2,
      },
    ]);
  }

  findImages() {
    return Promise.resolve([]);
  }
}

class FakeShadeRepository {
  findActiveByProduct() {
    return Promise.resolve([{ code: "SM-1", name: "Ivory", hex: "#fffff0" }]);
  }
}

class FakePublicCategoryService {
  getBySlug(slug: string) {
    return Promise.resolve({
      path: [
        { slug: "interior", name: "Interior" },
        { slug, name: "Emulsion" },
      ],
    });
  }
}

function service(products = new FakeProductRepository()) {
  return new PublicProductService(
    products as unknown as ProductRepository,
    new FakeShadeRepository() as unknown as ShadeRepository,
    new FakePublicCategoryService() as unknown as PublicCategoryService,
    {} as FileService,
  );
}

describe("PublicProductService", () => {
  it("maps stock to availability and never returns the counts", async () => {
    const product = await service().getBySlug("silk");

    expect(product.variants.map((v) => [v.volumeMl, v.availability])).toEqual([
      [1000, "askInStore"],
      [4000, "lowStock"],
      [20000, "inStock"],
    ]);
    for (const variant of product.variants) {
      expect(variant).not.toHaveProperty("currentStock");
      expect(variant).not.toHaveProperty("reorderLevel");
    }
    expect(product).not.toHaveProperty("isActive");
  });

  it("carries the category breadcrumb and the product's shades", async () => {
    const product = await service().getBySlug("silk");
    expect(product.categoryPath.map((c) => c.slug)).toEqual(["interior", "emulsion"]);
    expect(product.category).toEqual({ slug: "emulsion", name: "Emulsion" });
    expect(product.shades).toEqual([{ code: "SM-1", name: "Ivory", hex: "#fffff0" }]);
  });

  it("throws not found for a hidden or unknown slug", async () => {
    const products = new FakeProductRepository();
    products.found = false;
    await expect(service(products).getBySlug("silk")).rejects.toBeInstanceOf(NotFoundException);
  });
});
