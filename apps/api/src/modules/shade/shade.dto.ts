import { BaseDto, z } from "@repo/http-kit";
import {
  publicShadeListQuerySchema,
  shadeCodeParamSchema,
  shadeInputSchema,
  shadeListQuerySchema,
} from "@repo/shared";

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

export class PublicShadeListQueryDto extends BaseDto {
  static override readonly schema = publicShadeListQuerySchema;
}

export class ShadeCodeParamsDto extends BaseDto {
  static override readonly schema = z.object({ code: shadeCodeParamSchema });
}

export const publicShadeSummarySchema = z.object({
  code: z.string(),
  name: z.string(),
  // Lowercase #rrggbb, sRGB.
  hex: z.string(),
});

const publicShadeShape = {
  ...publicShadeSummarySchema.shape,
  // The product this shade is mixed in, when that product is on sale.
  product: z.object({ slug: z.string(), name: z.string() }).nullable(),
};

export class PublicShadeListItemDto extends BaseDto {
  static override readonly schema = z.object(publicShadeShape);
}

export class PublicShadeDto extends BaseDto {
  static override readonly schema = z.object({
    ...publicShadeShape,
    colourSets: z.array(z.object({ slug: z.string(), name: z.string() })),
  });
}
