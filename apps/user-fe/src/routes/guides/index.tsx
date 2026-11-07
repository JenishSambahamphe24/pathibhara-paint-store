import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { PageSkeleton } from "#/components/PageSkeleton/PageSkeleton";

import { GuideApi } from "#/features/guides/api";
import { GuidesPage } from "#/features/guides/components/GuidesPage";
import { SeoHelper } from "#/lib/helpers/seo.helper";

const GUIDES_PAGE_SIZE = 13;

export const Route = createFileRoute("/guides/")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ deps }) => {
    const guides = await GuideApi.list({
      perPage: GUIDES_PAGE_SIZE,
      page: deps.page,
    });
    // A page past the end is a 404, not a blank page search engines keep.
    if (deps.page > Math.max(1, guides.pagination.totalPages)) throw notFound();
    return guides;
  },
  head: ({ loaderData }) =>
    SeoHelper.page({
      title: "Painting guides",
      description:
        "Practical guides from the shop counter: waterproofing before the monsoon, primers, and choosing exterior colours.",
      path: "/guides",
      noIndex: (loaderData?.pagination.page ?? 1) > 1,
    }),
  component: RouteComponent,
  pendingComponent: () => <PageSkeleton kind="grid" />,
});

function RouteComponent() {
  return <GuidesPage guides={Route.useLoaderData()} />;
}
