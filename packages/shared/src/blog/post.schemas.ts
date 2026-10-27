import { z } from "zod";

import { slugInputSchema } from "../helpers/slug.schema";
import { TextSchema } from "../helpers/text.schema";
import { ListQuerySchema, paginationQueryShape, searchQueryShape } from "../list/list-query.schemas";
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "../seo/constants";
import { POST_STATUSES } from "./constants";
import { PostContentHelper } from "./post-content.helper";

const TITLE_MAX = 200;
const EXCERPT_MAX = 300;
// Generous for a long article, small enough to keep one bad paste from
// storing megabytes of markup.
const CONTENT_MAX_BYTES = 500_000;

const contentNodeSchema: z.ZodType<{ type: string }> = z.lazy(() =>
  z
    .object({
      type: z.string().min(1),
      text: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      marks: z.array(z.object({ type: z.string(), attrs: z.record(z.string(), z.unknown()).optional() })).optional(),
      content: z.array(contentNodeSchema).optional(),
    })
    .strict(),
);

export const postContentSchema = z
  .object({ type: z.literal("doc"), content: z.array(contentNodeSchema).optional() })
  .refine((doc) => JSON.stringify(doc).length <= CONTENT_MAX_BYTES, { message: "The post is too long" });

const translationFields = {
  excerpt: TextSchema.optional(EXCERPT_MAX),
  contentJson: postContentSchema,
  seoTitle: TextSchema.optional(SEO_TITLE_MAX_LENGTH),
  seoDescription: TextSchema.optional(SEO_DESCRIPTION_MAX_LENGTH),
};

export const postTranslationSchema = z
  .object({ title: TextSchema.required(TITLE_MAX, "Add a title"), ...translationFields })
  .superRefine((value, ctx) => {
    if (!PostContentHelper.hasContent(value.contentJson)) {
      ctx.addIssue({ code: "custom", path: ["contentJson"], message: "Write some content" });
    }
  });

// No Nepali title means no Nepali version; anything else written in Nepali
// then needs the title too.
export const optionalPostTranslationSchema = z
  .object({ title: TextSchema.optional(TITLE_MAX), ...translationFields })
  .superRefine((value, ctx) => {
    const hasOther =
      value.excerpt || value.seoTitle || value.seoDescription || PostContentHelper.hasContent(value.contentJson);
    if (!value.title && hasOther) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "Add the Nepali title, or clear the Nepali fields" });
    }
    if (value.title && !PostContentHelper.hasContent(value.contentJson)) {
      ctx.addIssue({ code: "custom", path: ["contentJson"], message: "Write the Nepali content" });
    }
  });

export const postInputSchema = z.object({
  slug: slugInputSchema,
  coverImageFileId: z.uuid().nullable(),
  translations: z.object({ en: postTranslationSchema, ne: optionalPostTranslationSchema }),
});
export type PostInput = z.input<typeof postInputSchema>;
export type PostInputParsed = z.output<typeof postInputSchema>;

export const postPublishSchema = z.object({
  // Back-dating is allowed (importing older articles); empty means now.
  publishedAt: z.iso.datetime({ offset: true }).optional(),
});
export type PostPublishInput = z.infer<typeof postPublishSchema>;

export const POST_SORT_KEYS = ["updatedAt", "publishedAt", "createdAt", "title"] as const;

export const postListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(POST_SORT_KEYS, "updatedAt"),
  status: ListQuerySchema.optionalEnum(POST_STATUSES),
});
export type PostListQuery = z.output<typeof postListQuerySchema>;
