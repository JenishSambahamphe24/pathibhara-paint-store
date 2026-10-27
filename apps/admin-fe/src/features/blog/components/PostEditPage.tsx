import { NotFound } from "#/components/NotFound/NotFound";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { usePost } from "../hooks/usePosts";
import { PostForm } from "./PostForm";

interface PostEditPageProps {
  postId: string;
}

export function PostEditPage({ postId }: PostEditPageProps) {
  const { data: post, isLoading, isError } = usePost(postId);
  if (isError) return <NotFound />;
  if (isLoading || !post) return <SkeletonCell />;
  // Keyed by id: the editor only takes its initial content when it mounts.
  return <PostForm key={post.id} post={post} />;
}
