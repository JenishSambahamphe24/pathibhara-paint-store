import { createFileRoute } from "@tanstack/react-router";

import { PostEditPage } from "#/features/blog/components/PostEditPage";

export const Route = createFileRoute("/(core)/blog/$postId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <PostEditPage postId={postId} />;
}
