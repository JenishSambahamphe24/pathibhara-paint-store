import type { ContentTranslationsInput } from "@repo/shared";
import type {
  IContentTranslation,
  IContentTranslations,
} from "#/types/content.types";

const EMPTY = { name: "", description: "", seoTitle: "", seoDescription: "" };

// Form inputs hold "" for empty text; the API sends null.
export class TranslationFormHelper {
  static empty(): ContentTranslationsInput {
    return { en: { ...EMPTY }, ne: { ...EMPTY } };
  }

  static fromApi(translations: IContentTranslations): ContentTranslationsInput {
    const toForm = (t: IContentTranslation | null) => ({
      name: t?.name ?? "",
      description: t?.description ?? "",
      seoTitle: t?.seoTitle ?? "",
      seoDescription: t?.seoDescription ?? "",
    });
    return { en: toForm(translations.en), ne: toForm(translations.ne) };
  }
}
