import type { IPublicCategory } from "../types";

// The API sends the tree flat and depth-first, each category with its path
// from the root; these read it without assuming any fixed depth.
export class CategoryTreeHelper {
  static children(
    categories: ReadonlyArray<IPublicCategory>,
    parentSlug: string | null,
  ): Array<IPublicCategory> {
    return categories.filter((category) => category.parentSlug === parentSlug);
  }

  // Slugs from the root down to and including this category.
  static pathSlugs(category: IPublicCategory | null): Set<string> {
    return new Set(category?.path.map((step) => step.slug) ?? []);
  }

  // A row is shown when every category above it is open.
  static isVisible(
    category: IPublicCategory,
    open: ReadonlySet<string>,
  ): boolean {
    return category.path
      .slice(0, -1)
      .every((ancestor) => open.has(ancestor.slug));
  }
}
