import { createFileRoute } from "@tanstack/react-router";

import { PostPreviewPage } from "#/features/blog/components/PostPreviewPage";

export const Route = createFileRoute("/(core)/blog/$postId/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <PostPreviewPage postId={postId} />;
}
