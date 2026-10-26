import { z } from "@repo/http-kit";

export const contentTranslationResponseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});

export const contentTranslationsResponseSchema = z.object({
  en: contentTranslationResponseSchema,
  ne: contentTranslationResponseSchema.nullable(),
});

export type TContentTranslationRow = z.infer<typeof contentTranslationResponseSchema> & {
  locale: "en" | "ne";
};

export class ContentTranslationsMapper {
  static fromRows(rows: Array<TContentTranslationRow>) {
    const pick = (locale: "en" | "ne") => {
      const row = rows.find((r) => r.locale === locale);
      return row
        ? {
            name: row.name,
            description: row.description,
            seoTitle: row.seoTitle,
            seoDescription: row.seoDescription,
          }
        : null;
    };
    const en = pick("en");
    if (!en) throw new Error("Content is missing its English translation");
    return { en, ne: pick("ne") };
  }
}
