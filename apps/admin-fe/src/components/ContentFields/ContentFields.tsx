import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "@repo/shared";

import { withFieldGroup } from "#/lib/form";
import { ContentFormHelper } from "#/lib/helpers/contentForm.helper";
import { m } from "#/paraglide/messages";

// Name, description and search metadata, shared by categories and products.
export const ContentFields = withFieldGroup({
  defaultValues: ContentFormHelper.empty(),
  render: function Render({ group }) {
    return (
      <div className="space-y-4">
        <group.AppField name="name">
          {(field) => <field.FormInput label={m.content_name()} required />}
        </group.AppField>
        <group.AppField name="description">
          {(field) => (
            <field.FormTextarea label={m.content_description()} rows={4} />
          )}
        </group.AppField>
        <div className="grid gap-4 sm:grid-cols-2">
          <group.AppField name="seoTitle">
            {(field) => (
              <field.FormInput
                label={m.content_seo_title()}
                maxLength={SEO_TITLE_MAX_LENGTH}
                hint={m.content_seo_title_hint({ max: SEO_TITLE_MAX_LENGTH })}
              />
            )}
          </group.AppField>
          <group.AppField name="seoDescription">
            {(field) => (
              <field.FormTextarea
                label={m.content_seo_description()}
                rows={2}
                hint={m.content_seo_description_hint({
                  max: SEO_DESCRIPTION_MAX_LENGTH,
                })}
              />
            )}
          </group.AppField>
        </div>
      </div>
    );
  },
});
