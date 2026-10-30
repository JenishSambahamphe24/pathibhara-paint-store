import { Link } from "@tanstack/react-router";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { NotFound } from "#/components/NotFound/NotFound";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { usePost } from "../hooks/usePosts";

interface PostPreviewPageProps {
  postId: string;
}

export function PostPreviewPage({ postId }: PostPreviewPageProps) {
  const { data: post, isLoading, isError } = usePost(postId);

  if (isError) return <NotFound />;
  if (isLoading || !post) return <SkeletonCell />;

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_content() },
          { title: m.sidebar_blog(), url: "/blog" },
          { title: post.title, url: `/blog/${post.id}` },
          { title: m.blog_preview() },
        ]}
      />
      <div className="mb-4 flex justify-end">
        <Link to="/blog/$postId" params={{ postId: post.id }}>
          <Button variant="outline">{m.blog_back_to_editor()}</Button>
        </Link>
      </div>

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
        <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
        <p className="mt-2 text-sm text-foreground-subtle">
          {post.authorName} ·{" "}
          {post.publishedAt
            ? DateHelper.formatDate(post.publishedAt)
            : m.blog_status_draft()}
        </p>
        {post.excerpt && (
          <p className="mt-4 text-lg text-foreground-muted">{post.excerpt}</p>
        )}
        {/* contentHtml was rendered and sanitized by the API when saved. */}
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </>
  );
}
