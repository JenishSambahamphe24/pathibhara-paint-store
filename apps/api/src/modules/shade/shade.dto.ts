import { BaseDto, z } from "@repo/http-kit";
import { shadeInputSchema, shadeListQuerySchema } from "@repo/shared";

export class ShadeInputDto extends BaseDto {
  static override readonly schema = shadeInputSchema;
}

export class ShadeListQueryDto extends BaseDto {
  static override readonly schema = shadeListQuerySchema;
}

export const shadeSummarySchema = z.object({
  id: z.uuid(),
  code: z.string(),
  hex: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

export class ShadeListItemDto extends BaseDto {
  static override readonly schema = shadeSummarySchema.extend({
    productId: z.uuid().nullable(),
    productName: z.string().nullable(),
    colourSetCount: z.number().int(),
    updatedAt: z.iso.datetime(),
  });
}

export class ShadeResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    code: z.string(),
    name: z.string(),
    hex: z.string(),
    productId: z.uuid().nullable(),
    productName: z.string().nullable(),
    isActive: z.boolean(),
    // Deleting is only possible while no colour set uses the shade.
    colourSetCount: z.number().int(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });
}
