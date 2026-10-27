import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { NotFound } from "#/components/NotFound/NotFound";
import { SkeletonCell } from "#/components/Table/SkeletonCell";
import { StatefulTabs } from "#/components/Tabs/StatefulTabs";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { usePost } from "../hooks/usePosts";

interface PostPreviewPageProps {
  postId: string;
}

export function PostPreviewPage({ postId }: PostPreviewPageProps) {
  const { data: post, isLoading, isError } = usePost(postId);
  const [locale, setLocale] = useState<"en" | "ne">("en");

  if (isError) return <NotFound />;
  if (isLoading || !post) return <SkeletonCell />;

  const translation = (locale === "ne" ? post.translations.ne : null) ?? post.translations.en;
  const isFallback = locale === "ne" && !post.translations.ne;

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_content() },
          { title: m.sidebar_blog(), url: "/blog" },
          { title: post.translations.en.title, url: `/blog/${post.id}` },
          { title: m.blog_preview() },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatefulTabs
          value={locale}
          onValueChange={(value) => setLocale(value as "en" | "ne")}
          items={[
            { value: "en", label: m.translations_english() },
            { value: "ne", label: m.translations_nepali() },
          ]}
        />
        <Link to="/blog/$postId" params={{ postId: post.id }}>
          <Button variant="outline">{m.blog_back_to_editor()}</Button>
        </Link>
      </div>
      {isFallback && <p className="mb-4 text-sm text-foreground-subtle">{m.blog_preview_fallback()}</p>}

      <article className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-8">
        {post.coverImage && (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.altText ?? ""}
            width={post.coverImage.width ?? undefined}
            height={post.coverImage.height ?? undefined}
            className="mb-6 aspect-video w-full rounded-lg object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-foreground">{translation.title}</h1>
        <p className="mt-2 text-sm text-foreground-subtle">
          {post.authorName} · {post.publishedAt ? DateHelper.formatDate(post.publishedAt) : m.blog_status_draft()}
        </p>
        {translation.excerpt && <p className="mt-4 text-lg text-foreground-muted">{translation.excerpt}</p>}
        {/* contentHtml was rendered and sanitized by the API when saved. */}
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: translation.contentHtml }} />
      </article>
    </>
  );
}
