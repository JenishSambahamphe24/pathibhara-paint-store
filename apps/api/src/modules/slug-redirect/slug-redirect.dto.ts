import { BaseDto, z } from "@repo/http-kit";
import { SLUG_ENTITY_TYPES, slugRedirectQuerySchema } from "@repo/shared";

export class SlugRedirectQueryDto extends BaseDto {
  static override readonly schema = slugRedirectQuerySchema;
}

export class SlugRedirectDto extends BaseDto {
  static override readonly schema = z.object({
    type: z.enum(SLUG_ENTITY_TYPES),
    // The entity's current slug; answer the old URL with a 301 to it.
    slug: z.string(),
  });
}
