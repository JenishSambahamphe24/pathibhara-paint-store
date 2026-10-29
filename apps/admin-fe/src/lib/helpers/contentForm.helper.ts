import type { IContent } from "#/types/content.types";

// Matches the shared schema's input: optional text may be null.
export interface IContentFormValues {
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

// Form inputs hold "" for empty text; the API sends null.
export class ContentFormHelper {
  static empty(): IContentFormValues {
    return { name: "", description: "", seoTitle: "", seoDescription: "" };
  }

  static fromApi(content: IContent): IContentFormValues {
    return {
      name: content.name,
      description: content.description ?? "",
      seoTitle: content.seoTitle ?? "",
      seoDescription: content.seoDescription ?? "",
    };
  }
}
