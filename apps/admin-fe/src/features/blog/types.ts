import type { IFile } from "#/types/content.types";
import type { PostStatus } from "@repo/shared";
import type { JSONContent } from "@tiptap/react";

export interface IPostListItem {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  authorName: string;
  coverImage: IFile | null;
  updatedAt: string;
}

export interface IPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentJson: JSONContent;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: PostStatus;
  publishedAt: string | null;
  authorName: string;
  coverImage: IFile | null;
  createdAt: string;
  updatedAt: string;
}

export type TPostFormValues = {
  slug: string;
  coverImageFileId: string | null;
  title: string;
  excerpt: string;
  contentJson: JSONContent;
  seoTitle: string;
  seoDescription: string;
};
