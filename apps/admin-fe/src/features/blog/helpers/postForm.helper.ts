import type { IPost, IPostTranslation, TPostFormValues, TPostTranslationFormValue } from "../types";

import { PostContentHelper } from "@repo/shared";

export class PostFormHelper {
  static emptyTranslation(): TPostTranslationFormValue {
    return { title: "", excerpt: "", contentJson: PostContentHelper.empty(), seoTitle: "", seoDescription: "" };
  }

  static defaults(post: IPost | null): TPostFormValues {
    const toForm = (t: IPostTranslation | null): TPostTranslationFormValue =>
      t
        ? {
            title: t.title,
            excerpt: t.excerpt ?? "",
            contentJson: t.contentJson,
            seoTitle: t.seoTitle ?? "",
            seoDescription: t.seoDescription ?? "",
          }
        : PostFormHelper.emptyTranslation();
    return {
      slug: post?.slug ?? "",
      coverImageFileId: post?.coverImage?.id ?? null,
      translations: { en: toForm(post?.translations.en ?? null), ne: toForm(post?.translations.ne ?? null) },
    };
  }
}
