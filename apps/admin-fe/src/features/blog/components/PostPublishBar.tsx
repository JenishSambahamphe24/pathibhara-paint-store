import type { IPost } from "../types";

import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/Button/Button";
import { Chip } from "#/components/Chip/Chip";
import { ConfirmDialog } from "#/components/ConfirmDialog/ConfirmDialog";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { usePostPublishing } from "../hooks/usePostPublishing";

interface PostPublishBarProps {
  post: IPost;
  hasUnsavedChanges: boolean;
}

export function PostPublishBar({
  post,
  hasUnsavedChanges,
}: PostPublishBarProps) {
  const { publish, unpublish } = usePostPublishing(post.id);
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
  const isPublished = post.status === "published";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3 text-sm">
        {isPublished ? (
          <Chip variant="success">{m.blog_status_published()}</Chip>
        ) : (
          <Chip variant="neutral">{m.blog_status_draft()}</Chip>
        )}
        <span className="text-foreground-subtle">
          {isPublished
            ? m.blog_published_on({
                date: DateHelper.formatDateTime(post.publishedAt),
              })
            : m.blog_draft_hint()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/blog/$postId/preview" params={{ postId: post.id }}>
          <Button variant="outline" startIcon={<Eye size={16} />}>
            {m.blog_preview()}
          </Button>
        </Link>
        {isPublished ? (
          <Button
            variant="outline"
            disabled={unpublish.isPending}
            onClick={() => setConfirmingUnpublish(true)}
          >
            {m.blog_unpublish()}
          </Button>
        ) : (
          <Button
            disabled={publish.isPending || hasUnsavedChanges}
            title={hasUnsavedChanges ? m.blog_save_before_publish() : undefined}
            onClick={() => publish.mutate()}
          >
            {m.blog_publish()}
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmingUnpublish}
        onOpenChange={setConfirmingUnpublish}
        title={m.blog_unpublish_title()}
        description={m.blog_unpublish_description()}
        confirmLabel={m.blog_unpublish()}
        isLoading={unpublish.isPending}
        onConfirm={() =>
          unpublish.mutate(undefined, {
            onSettled: () => setConfirmingUnpublish(false),
          })
        }
      />
    </div>
  );
}
