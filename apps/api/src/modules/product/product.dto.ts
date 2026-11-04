import { BaseDto, z } from "@repo/http-kit";
import {
  productInputSchema,
  productListQuerySchema,
  publicProductListQuerySchema,
  STOCK_AVAILABILITIES,
  variantSearchQuerySchema,
} from "@repo/shared";

import { publicCategoryRefSchema } from "../category/category.dto";
import { contentResponseShape } from "../common/content.dto";
import { FileResponseDto, PublicImageDto } from "../file/file.dto";

export class ProductInputDto extends BaseDto {
  static override readonly schema = productInputSchema;
}

export class ProductListQueryDto extends BaseDto {
  static override readonly schema = productListQuerySchema;
}

export class VariantSearchQueryDto extends BaseDto {
  static override readonly schema = variantSearchQuerySchema;
}

const variantSchema = z.object({
  id: z.uuid(),
  volumeMl: z.number().int(),
  pricePaisa: z.number().int(),
  sku: z.string(),
  reorderLevel: z.number().int(),
  currentStock: z.number().int(),
  isActive: z.boolean(),
  // A size with ledger rows can be deactivated but not removed or resized.
  hasHistory: z.boolean(),
});

export class ProductResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    categoryId: z.uuid(),
    categoryPath: z.array(z.string()),
    slug: z.string(),
    coverageSqftPerLitre: z.number(),
    defaultCoats: z.number().int(),
    isActive: z.boolean(),
    ...contentResponseShape,
    images: z.array(FileResponseDto.schema),
    variants: z.array(variantSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });
}

export class ProductListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    categoryId: z.uuid(),
    categoryName: z.string().nullable(),
    isActive: z.boolean(),
    coverageSqftPerLitre: z.number(),
    defaultCoats: z.number().int(),
    coverImage: FileResponseDto.schema.nullable(),
    variantCount: z.number().int(),
    minPricePaisa: z.number().int().nullable(),
    maxPricePaisa: z.number().int().nullable(),
    totalStock: z.number().int(),
    lowStockCount: z.number().int(),
    updatedAt: z.iso.datetime(),
  });
}

export class VariantSummaryDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    productId: z.uuid(),
    productName: z.string(),
    productSlug: z.string(),
    productIsActive: z.boolean(),
    volumeMl: z.number().int(),
    pricePaisa: z.number().int(),
    sku: z.string(),
    reorderLevel: z.number().int(),
    currentStock: z.number().int(),
    isActive: z.boolean(),
  });
}

export class PublicProductListQueryDto extends BaseDto {
  static override readonly schema = publicProductListQuerySchema;
}

export const publicProductRefSchema = z.object({ slug: z.string(), name: z.string() });

export class PublicProductListItemDto extends BaseDto {
  static override readonly schema = z.object({
    // The calculator takes product ids.
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    category: publicCategoryRefSchema,
    coverImage: PublicImageDto.schema.nullable(),
    // Over active sizes only; null when the product has none on sale.
    minPricePaisa: z.number().int().nullable(),
    maxPricePaisa: z.number().int().nullable(),
    variantCount: z.number().int(),
    // Starts the coats when the calculator adds this product.
    defaultCoats: z.number().int(),
    updatedAt: z.iso.datetime(),
  });
}

export class PublicProductDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    ...contentResponseShape,
    coverageSqftPerLitre: z.number(),
    defaultCoats: z.number().int(),
    category: publicCategoryRefSchema,
    // Root down to the product's own category, for breadcrumbs.
    categoryPath: z.array(publicCategoryRefSchema),
    // First image is the cover (and Open Graph image).
    images: z.array(PublicImageDto.schema),
    variants: z.array(
      z.object({
        id: z.uuid(),
        volumeMl: z.number().int(),
        pricePaisa: z.number().int(),
        availability: z.enum(STOCK_AVAILABILITIES),
      }),
    ),
    shades: z.array(z.object({ code: z.string(), name: z.string(), hex: z.string() })),
    updatedAt: z.iso.datetime(),
  });
}
