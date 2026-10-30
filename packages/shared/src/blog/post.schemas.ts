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

export const postInputSchema = z
  .object({
    slug: slugInputSchema,
    coverImageFileId: z.uuid().nullable(),
    title: TextSchema.required(TITLE_MAX, "Add a title"),
    excerpt: TextSchema.optional(EXCERPT_MAX),
    contentJson: postContentSchema,
    seoTitle: TextSchema.optional(SEO_TITLE_MAX_LENGTH),
    seoDescription: TextSchema.optional(SEO_DESCRIPTION_MAX_LENGTH),
  })
  .superRefine((value, ctx) => {
    if (!PostContentHelper.hasContent(value.contentJson)) {
      ctx.addIssue({ code: "custom", path: ["contentJson"], message: "Write some content" });
    }
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

// The public blog is always newest first, so it takes no sort parameters.
export const publicPostListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
});
export type PublicPostListQuery = z.output<typeof publicPostListQuerySchema>;
