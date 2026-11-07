import type { FileService } from "../file/file.service";
import type { CategoryRepository } from "./category.repository";

import { describe, expect, it } from "vitest";

import { NotFoundException } from "@repo/http-kit";

import { PublicCategoryService } from "./public-category.service";

type TRow = Awaited<ReturnType<CategoryRepository["findVisible"]>>[number];

function row(id: string, parentId: string | null, sortOrder: number, productCount = 0): TRow {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    category: {
      id,
      parentId,
      slug: id,
      name: id.toUpperCase(),
      description: null,
      seoTitle: null,
      seoDescription: null,
      sortOrder,
      isActive: true,
      imageFileId: null,
      createdAt: now,
      updatedAt: now,
    },
    productCount,
    imageFile: null,
  };
}

class FakeCategoryRepository {
  constructor(readonly rows: Array<TRow>) {}

  findVisible() {
    return Promise.resolve(this.rows);
  }
}

function service(rows: Array<TRow>) {
  return new PublicCategoryService(
    new FakeCategoryRepository(rows) as unknown as CategoryRepository,
    {} as FileService,
  );
}

describe("PublicCategoryService", () => {
  it("walks the tree depth-first with slug breadcrumbs", async () => {
    const tree = await service([
      row("interior", null, 0, 3),
      row("exterior", null, 1, 1),
      row("emulsion", "interior", 0, 2),
    ]).tree();

    expect(tree.map((c) => [c.slug, c.parentSlug, c.depth, c.childCount])).toEqual([
      ["interior", null, 0, 1],
      ["emulsion", "interior", 1, 0],
      ["exterior", null, 0, 0],
    ]);
    expect(tree[1].path).toEqual([
      { slug: "interior", name: "INTERIOR" },
      { slug: "emulsion", name: "EMULSION" },
    ]);
    expect(tree[0].productCount).toBe(3);
  });

  it("leaves out a category whose parent wasn't returned", async () => {
    const tree = await service([row("interior", null, 0), row("orphan", "hidden", 0)]).tree();
    expect(tree.map((c) => c.slug)).toEqual(["interior"]);
  });

  it("throws not found for an unknown slug", async () => {
    await expect(service([]).getBySlug("nope")).rejects.toBeInstanceOf(NotFoundException);
  });
});
