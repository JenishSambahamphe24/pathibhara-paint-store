import { BaseDto, z } from "@repo/http-kit";
import {
  POST_STATUSES,
  postInputSchema,
  postListQuerySchema,
  postPublishSchema,
  publicPostListQuerySchema,
} from "@repo/shared";

import { FileResponseDto, PublicImageDto } from "../file/file.dto";

export class PostInputDto extends BaseDto {
  static override readonly schema = postInputSchema;
}

export class PostPublishDto extends BaseDto {
  static override readonly schema = postPublishSchema;
}

export class PostListQueryDto extends BaseDto {
  static override readonly schema = postListQuerySchema;
}

export class PostListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
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
    title: z.string(),
    excerpt: z.string().nullable(),
    contentJson: z.record(z.string(), z.unknown()),
    // Sanitized at save time; safe to render as-is.
    contentHtml: z.string(),
    seoTitle: z.string().nullable(),
    seoDescription: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });
}

export class PublicPostListQueryDto extends BaseDto {
  static override readonly schema = publicPostListQuerySchema;
}

const publicPostShape = {
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  // Also the Open Graph image.
  coverImage: PublicImageDto.schema.nullable(),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export class PublicPostListItemDto extends BaseDto {
  static override readonly schema = z.object(publicPostShape);
}

export class PublicPostDto extends BaseDto {
  static override readonly schema = z.object({
    ...publicPostShape,
    // Rendered by PostHtmlRenderer and sanitized at save time; safe to
    // render as-is.
    contentHtml: z.string(),
    seoTitle: z.string().nullable(),
    seoDescription: z.string().nullable(),
  });
}
