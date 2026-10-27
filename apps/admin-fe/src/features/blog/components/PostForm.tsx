import type { IPost } from "../types";

import { Link } from "@tanstack/react-router";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { FormSection } from "#/components/FormSection/FormSection";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { UnsavedChangesDialog } from "#/components/UnsavedChangesDialog/UnsavedChangesDialog";

import { useUnsavedChanges } from "#/hooks/useUnsavedChanges";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { usePostForm } from "../hooks/usePostForm";
import { PostCoverField } from "./PostCoverField";
import { PostLocaleFields } from "./PostLocaleFields";
import { PostPublishBar } from "./PostPublishBar";

interface PostFormProps {
  post: IPost | null;
}

export function PostForm({ post }: PostFormProps) {
  const { form, handleSubmit } = usePostForm(post);
  const title = post ? post.translations.en.title : m.blog_new_title();

  return (
    <form.AppForm>
      <BreadCrumb items={[{ title: m.sidebar_content() }, { title: m.sidebar_blog(), url: "/blog" }, { title }]} />
      <form onSubmit={FormHelper.submitHandler(handleSubmit)} noValidate className="space-y-5">
        <form.Subscribe selector={(state) => [state.isSubmitting, state.isDirty] as const}>
          {([isSubmitting, isDirty]) => (
            <>
              <PageHeader
                title={title}
                description={post?.status === "published" ? m.blog_live_edit_hint() : m.blog_editor_description()}
                actions={
                  <>
                    <Link to="/blog" className="text-sm text-foreground-subtle hover:text-foreground">
                      {m.common_back_to_list()}
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? m.common_saving() : post ? m.common_save() : m.blog_save_draft()}
                    </Button>
                  </>
                }
              />
              {post && <PostPublishBar post={post} hasUnsavedChanges={isDirty} />}
              <UnsavedGuard isDirty={isDirty && !isSubmitting} />
            </>
          )}
        </form.Subscribe>

        <FormSection title={m.translations_english()}>
          <PostLocaleFields form={form} locale="en" />
        </FormSection>

        <FormSection title={m.translations_nepali()} description={m.blog_nepali_hint()}>
          <PostLocaleFields form={form} locale="ne" />
        </FormSection>

        <FormSection title={m.blog_section_cover()}>
          <form.Field name="coverImageFileId">
            {(field) => (
              <PostCoverField value={field.state.value} initialFile={post?.coverImage ?? null} onChange={field.handleChange} />
            )}
          </form.Field>
        </FormSection>

        <FormSection title={m.products_section_seo()}>
          <form.AppField name="slug">
            {(field) => (
              <field.FormInput label={m.common_slug()} placeholder={m.common_slug_placeholder()} hint={m.common_slug_hint()} />
            )}
          </form.AppField>
        </FormSection>
      </form>
    </form.AppForm>
  );
}

interface UnsavedGuardProps {
  isDirty: boolean;
}

function UnsavedGuard({ isDirty }: UnsavedGuardProps) {
  const { isBlocked, proceed, reset } = useUnsavedChanges({ isDirty });
  return <UnsavedChangesDialog open={isBlocked} onDiscard={proceed} onCancel={reset} />;
}
