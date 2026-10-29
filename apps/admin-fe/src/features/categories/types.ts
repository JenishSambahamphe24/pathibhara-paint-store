import type { IContent } from "#/types/content.types";

export interface ICategory extends IContent {
  id: string;
  parentId: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  depth: number;
  path: Array<string>;
  productCount: number;
  childCount: number;
}
