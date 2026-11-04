import type { IPublicCategory } from "../types";

import { describe, expect, test } from "vitest";

import { CategoryTreeHelper } from "./categoryTree.helper";

function category(slug: string, parents: Array<string>): IPublicCategory {
  const path = [...parents, slug].map((step) => ({ slug: step, name: step }));
  return {
    slug,
    parentSlug: parents.at(-1) ?? null,
    depth: parents.length,
    path,
    name: slug,
    description: null,
    seoTitle: null,
    seoDescription: null,
    image: null,
    productCount: 1,
    childCount: 0,
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

const tree = [
  category("primer", []),
  category("exterior-primer", ["primer"]),
  category("damp-proof", ["primer", "exterior-primer"]),
  category("enamel", []),
];

describe("CategoryTreeHelper", () => {
  test("lists a level's children at any depth", () => {
    expect(
      CategoryTreeHelper.children(tree, null).map((item) => item.slug),
    ).toEqual(["primer", "enamel"]);
    expect(
      CategoryTreeHelper.children(tree, "exterior-primer").map(
        (item) => item.slug,
      ),
    ).toEqual(["damp-proof"]);
  });

  test("shows a row only when every ancestor is open", () => {
    const deep = tree[2];

    expect(CategoryTreeHelper.isVisible(deep, new Set(["primer"]))).toBe(false);
    expect(
      CategoryTreeHelper.isVisible(
        deep,
        new Set(["primer", "exterior-primer"]),
      ),
    ).toBe(true);
    expect(CategoryTreeHelper.isVisible(tree[0], new Set())).toBe(true);
  });
});
