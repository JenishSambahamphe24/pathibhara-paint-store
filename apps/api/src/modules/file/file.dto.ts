import { BaseDto, z } from "@repo/http-kit";

export class FileResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    url: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
    blurHash: z.string().nullable(),
    altText: z.string().nullable(),
  });
}

export class UploadImageRequestDto extends BaseDto {
  static override readonly schema = z.object({
    altText: z.string().trim().max(200).optional(),
    prefix: z.enum(["products", "categories", "posts"]).default("products"),
  });
}

// What a public page needs to render an image without layout shift; upload
// bookkeeping (original name, size, uploader) stays internal.
export class PublicImageDto extends BaseDto {
  static override readonly schema = z.object({
    url: z.string(),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
    alt: z.string().nullable(),
    blurHash: z.string().nullable(),
  });
}
