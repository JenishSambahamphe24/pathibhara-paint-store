import { z } from "zod";

import { slugParamSchema } from "../helpers/slug.schema";
import { SLUG_ENTITY_TYPES } from "./constants";

export const slugRedirectQuerySchema = z.object({
  type: z.enum(SLUG_ENTITY_TYPES),
  slug: slugParamSchema,
});
export type SlugRedirectQuery = z.output<typeof slugRedirectQuerySchema>;
