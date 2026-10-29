import type { IPost, TPostFormValues } from "../types";

import { PostContentHelper } from "@repo/shared";

export class PostFormHelper {
  static defaults(post: IPost | null): TPostFormValues {
    return {
      slug: post?.slug ?? "",
      coverImageFileId: post?.coverImage?.id ?? null,
      title: post?.title ?? "",
      excerpt: post?.excerpt ?? "",
      contentJson: post?.contentJson ?? PostContentHelper.empty(),
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
    };
  }
}
