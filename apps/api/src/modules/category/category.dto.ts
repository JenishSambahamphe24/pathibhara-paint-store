import { BaseDto, z } from "@repo/http-kit";
import { categoryInputSchema, categoryReorderSchema } from "@repo/shared";

import { contentResponseShape } from "../common/content.dto";
import { PublicImageDto } from "../file/file.dto";

export class CategoryInputDto extends BaseDto {
  static override readonly schema = categoryInputSchema;
}

export class CategoryReorderDto extends BaseDto {
  static override readonly schema = categoryReorderSchema;
}

export class CategoryResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    parentId: z.uuid().nullable(),
    slug: z.string(),
    sortOrder: z.number().int(),
    isActive: z.boolean(),
    // Depth-first position in the tree: 0 for top level.
    depth: z.number().int(),
    // Names from the root down to this category.
    path: z.array(z.string()),
    productCount: z.number().int(),
    childCount: z.number().int(),
    ...contentResponseShape,
  });
}

export const publicCategoryRefSchema = z.object({ slug: z.string(), name: z.string() });

export class PublicCategoryDto extends BaseDto {
  static override readonly schema = z.object({
    slug: z.string(),
    parentSlug: z.string().nullable(),
    // Depth-first position in the tree: 0 for top level.
    depth: z.number().int(),
    // From the root down to and including this category, for breadcrumbs.
    path: z.array(publicCategoryRefSchema),
    ...contentResponseShape,
    image: PublicImageDto.schema.nullable(),
    // Active products in this category and all of its visible subcategories.
    productCount: z.number().int(),
    childCount: z.number().int(),
    updatedAt: z.iso.datetime(),
  });
}
