import { POST_STATUSES, postInputSchema, postListQuerySchema, postPublishSchema } from "@repo/shared";

import { BaseDto, z } from "@repo/http-kit";

import { FileResponseDto } from "../file/file.dto";

export class PostInputDto extends BaseDto {
  static override readonly schema = postInputSchema;
}

export class PostPublishDto extends BaseDto {
  static override readonly schema = postPublishSchema;
}

export class PostListQueryDto extends BaseDto {
  static override readonly schema = postListQuerySchema;
}

const translationResponse = z.object({
  title: z.string(),
  excerpt: z.string().nullable(),
  contentJson: z.record(z.string(), z.unknown()),
  // Sanitized at save time; safe to render as-is.
  contentHtml: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});

export class PostListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
    hasNepali: z.boolean(),
    status: z.enum(POST_STATUSES),
    publishedAt: z.iso.datetime().nullable(),
    authorName: z.string(),
    coverImage: FileResponseDto.schema.nullable(),
    updatedAt: z.iso.datetime(),
  });
}

export class PostDetailDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    status: z.enum(POST_STATUSES),
    publishedAt: z.iso.datetime().nullable(),
    authorName: z.string(),
    coverImage: FileResponseDto.schema.nullable(),
    translations: z.object({ en: translationResponse, ne: translationResponse.nullable() }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });
}
