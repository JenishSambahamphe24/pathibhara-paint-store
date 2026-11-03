import type { IPublicImage } from "#/types/api.types";

export interface IPublicPost {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: IPublicImage | null;
  publishedAt: string;
  updatedAt: string;
  // Sanitized by the API when the post was saved; safe to render as-is.
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
}
