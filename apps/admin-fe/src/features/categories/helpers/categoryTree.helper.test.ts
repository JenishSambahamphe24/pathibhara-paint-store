import type { ICategory } from "../types";

import { describe, expect, test } from "vitest";

import { CategoryTreeHelper } from "./categoryTree.helper";

function category(
  id: string,
  parentId: string | null,
  name: string,
  isActive = true,
): ICategory {
  return {
    id,
    parentId,
    slug: name.toLowerCase(),
    sortOrder: 0,
    isActive,
    depth: 0,
    path: [name],
    productCount: 0,
    childCount: 0,
    translations: {
      en: { name, description: null, seoTitle: null, seoDescription: null },
      ne: null,
    },
  };
}

const tree = [
  category("p", null, "Primer"),
  category("e", "p", "Exterior"),
  category("d", "e", "Damp"),
  category("i", "p", "Interior", false),
  category("c", null, "Colour"),
];

describe("CategoryTreeHelper", () => {
  test("subtree includes all descendants", () => {
    expect([...CategoryTreeHelper.subtreeIds(tree, "p")].sort()).toEqual([
      "d",
      "e",
      "i",
      "p",
    ]);
  });

  test("parent options exclude the category's own subtree", () => {
    expect(CategoryTreeHelper.options(tree, "e").map((o) => o.value)).toEqual([
      "p",
      "i",
      "c",
    ]);
  });

  test("search keeps ancestors of matches", () => {
    expect(
      CategoryTreeHelper.filter(tree, "damp", null).map((c) => c.id),
    ).toEqual(["p", "e", "d"]);
  });

  test("status filter", () => {
    expect(
      CategoryTreeHelper.filter(tree, "", "inactive").map((c) => c.id),
    ).toEqual(["p", "i"]);
  });
});
