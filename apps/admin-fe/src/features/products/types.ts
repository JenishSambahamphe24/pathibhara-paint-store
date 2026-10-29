import type { ProductInput, ProductVariantInput } from "@repo/shared";
import type { IContent, IFile } from "#/types/content.types";

export interface IProductListItem {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string | null;
  isActive: boolean;
  coverageSqftPerLitre: number;
  defaultCoats: number;
  coverImage: IFile | null;
  variantCount: number;
  minPricePaisa: number | null;
  maxPricePaisa: number | null;
  totalStock: number;
  lowStockCount: number;
  updatedAt: string;
}

export interface IProductVariant {
  id: string;
  volumeMl: number;
  pricePaisa: number;
  sku: string;
  reorderLevel: number;
  currentStock: number;
  isActive: boolean;
  hasHistory: boolean;
}

export interface IProduct extends IContent {
  id: string;
  categoryId: string;
  categoryPath: Array<string>;
  slug: string;
  coverageSqftPerLitre: number;
  defaultCoats: number;
  isActive: boolean;
  images: Array<IFile>;
  variants: Array<IProductVariant>;
  createdAt: string;
  updatedAt: string;
}

export interface IVariantSummary {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productIsActive: boolean;
  volumeMl: number;
  pricePaisa: number;
  sku: string;
  reorderLevel: number;
  currentStock: number;
  isActive: boolean;
}

type TNullable<T, TKeys extends keyof T> = Omit<T, TKeys> & {
  [P in TKeys]: T[P] | null;
};

// The form holds null for a number nobody has typed yet; the shared schema
// turns that into "Enter a size" / "Enter a valid price" on submit.
export type TProductVariantFormValue = TNullable<
  ProductVariantInput,
  "volumeMl" | "pricePaisa" | "reorderLevel"
>;
export type TProductFormValues = Omit<
  TNullable<ProductInput, "coverageSqftPerLitre" | "defaultCoats">,
  "variants" | "categoryId"
> & { categoryId: string | null; variants: Array<TProductVariantFormValue> };
