import type { IContentTranslations } from "#/types/content.types";

export interface ICategory {
  id: string;
  parentId: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  depth: number;
  path: Array<string>;
  productCount: number;
  childCount: number;
  translations: IContentTranslations;
}
