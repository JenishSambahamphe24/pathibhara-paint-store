import { BaseDto, z } from "@repo/http-kit";
import { colourSetInputSchema, colourSetListQuerySchema } from "@repo/shared";

import { shadeSummarySchema } from "../shade/shade.dto";

export class ColourSetInputDto extends BaseDto {
  static override readonly schema = colourSetInputSchema;
}

export class ColourSetListQueryDto extends BaseDto {
  static override readonly schema = colourSetListQuerySchema;
}

const componentShadesSchema = z.object({
  main_surface: shadeSummarySchema,
  columns: shadeSummarySchema,
  doors_windows: shadeSummarySchema,
  roof_edge: shadeSummarySchema,
});

export class ColourSetListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    isActive: z.boolean(),
    shades: componentShadesSchema,
    updatedAt: z.iso.datetime(),
  });
}

export class ColourSetResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    isActive: z.boolean(),
    name: z.string(),
    description: z.string().nullable(),
    shades: componentShadesSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });
}
