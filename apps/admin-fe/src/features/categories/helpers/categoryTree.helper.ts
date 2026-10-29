import type { ICategory } from "../types";

export class CategoryTreeHelper {
  // Ids of `rootId` and everything beneath it (the list is depth-first).
  static subtreeIds(categories: Array<ICategory>, rootId: string): Set<string> {
    const ids = new Set<string>([rootId]);
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId)) ids.add(category.id);
    }
    return ids;
  }

  // Options for a "parent" select: each category labelled by its full path,
  // optionally excluding a subtree (a category can't move under itself).
  static options(categories: Array<ICategory>, excludeSubtreeOf?: string) {
    const excluded = excludeSubtreeOf
      ? CategoryTreeHelper.subtreeIds(categories, excludeSubtreeOf)
      : new Set();
    return categories
      .filter((category) => !excluded.has(category.id))
      .map((category) => ({
        value: category.id,
        label:
          category.path.join(" › ") + (category.isActive ? "" : " (inactive)"),
      }));
  }

  // Rows to show for a search: matches plus their ancestors, so a match is
  // never shown without the branch it sits in.
  static filter(
    categories: Array<ICategory>,
    search: string,
    status: "active" | "inactive" | null,
  ) {
    const term = search.trim().toLowerCase();
    const matches = (c: ICategory) =>
      (!term || c.name.toLowerCase().includes(term) || c.slug.includes(term)) &&
      (!status || c.isActive === (status === "active"));

    if (!term && !status) return categories;
    const byId = new Map(categories.map((c) => [c.id, c]));
    const visible = new Set<string>();
    for (const category of categories.filter(matches)) {
      let cursor: ICategory | undefined = category;
      while (cursor && !visible.has(cursor.id)) {
        visible.add(cursor.id);
        cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
      }
    }
    return categories.filter((c) => visible.has(c.id));
  }

  static siblings(
    categories: Array<ICategory>,
    category: ICategory,
  ): Array<ICategory> {
    return categories.filter((c) => c.parentId === category.parentId);
  }
}
