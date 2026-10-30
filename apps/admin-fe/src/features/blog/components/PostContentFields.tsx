import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "@repo/shared";

import { FileApi } from "#/features/files/api";
import { withForm } from "#/lib/form";
import { m } from "#/paraglide/messages";

import { PostFormHelper } from "../helpers/postForm.helper";

async function uploadInlineImage(file: File) {
  const uploaded = await FileApi.uploadImage(file, "posts");
  return {
    src: uploaded.url,
    alt: uploaded.altText ?? file.name.replace(/\.[^.]+$/, ""),
  };
}

export const PostContentFields = withForm({
  defaultValues: PostFormHelper.defaults(null),
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <form.AppField name="title">
          {(field) => <field.FormInput label={m.blog_field_title()} required />}
        </form.AppField>
        <form.AppField name="excerpt">
          {(field) => (
            <field.FormTextarea
              label={m.blog_field_excerpt()}
              rows={2}
              hint={m.blog_field_excerpt_hint()}
            />
          )}
        </form.AppField>
        <form.AppField name="contentJson">
          {(field) => (
            <field.FormRichText
              label={m.blog_field_content()}
              required
              placeholder={m.blog_field_content_placeholder()}
              onUploadImage={uploadInlineImage}
            />
          )}
        </form.AppField>
        <div className="grid gap-4 md:grid-cols-2">
          <form.AppField name="seoTitle">
            {(field) => (
              <field.FormInput
                label={m.content_seo_title()}
                maxLength={SEO_TITLE_MAX_LENGTH}
                hint={m.content_seo_title_hint({ max: SEO_TITLE_MAX_LENGTH })}
              />
            )}
          </form.AppField>
          <form.AppField name="seoDescription">
            {(field) => (
              <field.FormTextarea
                label={m.content_seo_description()}
                rows={2}
                hint={m.content_seo_description_hint({
                  max: SEO_DESCRIPTION_MAX_LENGTH,
                })}
              />
            )}
          </form.AppField>
        </div>
      </div>
    );
  },
});
