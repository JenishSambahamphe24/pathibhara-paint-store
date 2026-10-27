import { createFileRoute } from "@tanstack/react-router";

import { PostForm } from "#/features/blog/components/PostForm";

export const Route = createFileRoute("/(core)/blog/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PostForm post={null} />;
}
