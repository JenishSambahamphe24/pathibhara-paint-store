import { BaseDto, z } from "@repo/http-kit";
import { productInputSchema, productListQuerySchema, variantSearchQuerySchema } from "@repo/shared";

import { contentTranslationsResponseSchema } from "../common/content-translations.dto";
import { FileResponseDto } from "../file/file.dto";

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
    translations: contentTranslationsResponseSchema,
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
    hasNepali: z.boolean(),
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
