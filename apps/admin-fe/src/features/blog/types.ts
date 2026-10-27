import type { IFile } from "#/types/content.types";
import type { PostStatus } from "@repo/shared";
import type { JSONContent } from "@tiptap/react";

export interface IPostTranslation {
  title: string;
  excerpt: string | null;
  contentJson: JSONContent;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface IPostListItem {
  id: string;
  slug: string;
  title: string;
  hasNepali: boolean;
  status: PostStatus;
  publishedAt: string | null;
  authorName: string;
  coverImage: IFile | null;
  updatedAt: string;
}

export interface IPost {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  authorName: string;
  coverImage: IFile | null;
  translations: { en: IPostTranslation; ne: IPostTranslation | null };
  createdAt: string;
  updatedAt: string;
}

export type TPostTranslationFormValue = {
  title: string;
  excerpt: string;
  contentJson: JSONContent;
  seoTitle: string;
  seoDescription: string;
};

export type TPostFormValues = {
  slug: string;
  coverImageFileId: string | null;
  translations: { en: TPostTranslationFormValue; ne: TPostTranslationFormValue };
};
