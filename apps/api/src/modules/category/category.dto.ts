import { BaseDto, z } from "@repo/http-kit";
import { categoryInputSchema, categoryReorderSchema } from "@repo/shared";

import { contentResponseShape } from "../common/content.dto";

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
