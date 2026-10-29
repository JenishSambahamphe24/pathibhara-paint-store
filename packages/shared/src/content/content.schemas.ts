import { TextSchema } from "../helpers/text.schema";
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "../seo/constants";

const NAME_MAX = 150;
const DESCRIPTION_MAX = 5000;

export const contentNameSchema = TextSchema.required(NAME_MAX, "Name is required");
export const contentDescriptionSchema = TextSchema.optional(DESCRIPTION_MAX);

export const seoFieldsShape = {
  seoTitle: TextSchema.optional(SEO_TITLE_MAX_LENGTH),
  seoDescription: TextSchema.optional(SEO_DESCRIPTION_MAX_LENGTH),
};

// Spread into z.object: a catalogue page's own text and its search metadata.
export const contentFieldsShape = {
  name: contentNameSchema,
  description: contentDescriptionSchema,
  ...seoFieldsShape,
};
