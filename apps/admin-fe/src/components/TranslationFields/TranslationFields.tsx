import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "@repo/shared";

import { withFieldGroup } from "#/lib/form";
import { TranslationFormHelper } from "#/lib/helpers/translationForm.helper";
import { m } from "#/paraglide/messages";

// English and Nepali side by side rather than in tabs: an error on the
// Nepali side can't hide behind an unselected tab.
export const TranslationFields = withFieldGroup({
  defaultValues: TranslationFormHelper.empty(),
  props: { showSeo: true },
  render: function Render({ group, showSeo }) {
    const locales = [
      { key: "en" as const, title: m.translations_english(), required: true },
      { key: "ne" as const, title: m.translations_nepali(), required: false },
    ];

    return (
      <div className="@container">
        <div className="grid gap-5 @2xl:grid-cols-2">
          {locales.map((locale) => (
            <div
              key={locale.key}
              className="space-y-4 rounded-lg border border-border-muted bg-surface-muted p-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {locale.title}
                </p>
                {!locale.required && (
                  <p className="text-xs text-foreground-subtle">
                    {m.translations_nepali_hint()}
                  </p>
                )}
              </div>
              <group.AppField name={`${locale.key}.name`}>
                {(field) => (
                  <field.FormInput
                    label={m.translations_name()}
                    required={locale.required}
                  />
                )}
              </group.AppField>
              <group.AppField name={`${locale.key}.description`}>
                {(field) => (
                  <field.FormTextarea
                    label={m.translations_description()}
                    rows={4}
                  />
                )}
              </group.AppField>
              {showSeo && (
                <>
                  <group.AppField name={`${locale.key}.seoTitle`}>
                    {(field) => (
                      <field.FormInput
                        label={m.translations_seo_title()}
                        maxLength={SEO_TITLE_MAX_LENGTH}
                        hint={m.translations_seo_title_hint({
                          max: SEO_TITLE_MAX_LENGTH,
                        })}
                      />
                    )}
                  </group.AppField>
                  <group.AppField name={`${locale.key}.seoDescription`}>
                    {(field) => (
                      <field.FormTextarea
                        label={m.translations_seo_description()}
                        rows={2}
                        hint={m.translations_seo_description_hint({
                          max: SEO_DESCRIPTION_MAX_LENGTH,
                        })}
                      />
                    )}
                  </group.AppField>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
});
