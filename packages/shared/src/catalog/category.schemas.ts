import { z } from "zod";

import { slugInputSchema } from "../helpers/slug.schema";
import { contentFieldsShape } from "../content/content.schemas";

export const categoryInputSchema = z.object({
  parentId: z.uuid().nullable(),
  slug: slugInputSchema,
  isActive: z.boolean(),
  ...contentFieldsShape,
});
export type CategoryInput = z.input<typeof categoryInputSchema>;

export const categoryReorderSchema = z.object({
  parentId: z.uuid().nullable(),
  orderedIds: z.array(z.uuid()).min(1),
});
export type CategoryReorderInput = z.infer<typeof categoryReorderSchema>;
