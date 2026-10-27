import { z } from "zod";

import { TextSchema } from "../helpers/text.schema";
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "../seo/constants";

const NAME_MAX = 150;
const DESCRIPTION_MAX = 5000;

const seoFields = {
  seoTitle: TextSchema.optional(SEO_TITLE_MAX_LENGTH),
  seoDescription: TextSchema.optional(SEO_DESCRIPTION_MAX_LENGTH),
};

export const contentTranslationSchema = z.object({
  name: TextSchema.required(NAME_MAX, "Name is required"),
  description: TextSchema.optional(DESCRIPTION_MAX),
  ...seoFields,
});

// Nepali is optional as a whole: an empty name means "no Nepali version",
// but filling any other Nepali field then requires the name.
export const optionalContentTranslationSchema = z
  .object({
    name: TextSchema.optional(NAME_MAX),
    description: TextSchema.optional(DESCRIPTION_MAX),
    ...seoFields,
  })
  .superRefine((value, ctx) => {
    const hasOther = value.description || value.seoTitle || value.seoDescription;
    if (!value.name && hasOther) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Add the Nepali name, or clear the other Nepali fields",
      });
    }
  });

export const contentTranslationsSchema = z.object({
  en: contentTranslationSchema,
  ne: optionalContentTranslationSchema,
});
export type ContentTranslationsInput = z.input<typeof contentTranslationsSchema>;
export type ContentTranslations = z.output<typeof contentTranslationsSchema>;

// Shades are named only; colour sets also carry a short description. Their
// tables have no SEO columns, so these are narrower than the content shape.
export const nameTranslationsSchema = z.object({
  en: z.object({ name: TextSchema.required(NAME_MAX, "Name is required") }),
  ne: z.object({ name: TextSchema.optional(NAME_MAX) }),
});
export type NameTranslationsInput = z.input<typeof nameTranslationsSchema>;
export type NameTranslations = z.output<typeof nameTranslationsSchema>;

export const describedTranslationsSchema = z.object({
  en: z.object({
    name: TextSchema.required(NAME_MAX, "Name is required"),
    description: TextSchema.optional(DESCRIPTION_MAX),
  }),
  ne: z
    .object({
      name: TextSchema.optional(NAME_MAX),
      description: TextSchema.optional(DESCRIPTION_MAX),
    })
    .superRefine((value, ctx) => {
      if (!value.name && value.description) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Add the Nepali name, or clear the Nepali description",
        });
      }
    }),
});
export type DescribedTranslationsInput = z.input<typeof describedTranslationsSchema>;
export type DescribedTranslations = z.output<typeof describedTranslationsSchema>;
