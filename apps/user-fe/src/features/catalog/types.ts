import type { StockAvailability } from "@repo/shared";
import type { IPublicImage, ISlugRef } from "#/types/api.types";

export interface IPublicCategory {
  slug: string;
  parentSlug: string | null;
  depth: number;
  // Root down to and including this category.
  path: Array<ISlugRef>;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  image: IPublicImage | null;
  // Active products here and in every visible subcategory.
  productCount: number;
  childCount: number;
  updatedAt: string;
}

export interface IPublicVariant {
  id: string;
  volumeMl: number;
  pricePaisa: number;
  availability: StockAvailability;
}

export interface IPublicProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverageSqftPerLitre: number;
  defaultCoats: number;
  category: ISlugRef;
  categoryPath: Array<ISlugRef>;
  // The first image is the cover.
  images: Array<IPublicImage>;
  variants: Array<IPublicVariant>;
  shades: Array<{ code: string; name: string; hex: string }>;
  updatedAt: string;
}

export interface IPublicProductListItem {
  id: string;
  slug: string;
  name: string;
  category: ISlugRef;
  coverImage: IPublicImage | null;
  // Over sizes on sale; null when none are.
  minPricePaisa: number | null;
  maxPricePaisa: number | null;
  variantCount: number;
  defaultCoats: number;
  updatedAt: string;
}
