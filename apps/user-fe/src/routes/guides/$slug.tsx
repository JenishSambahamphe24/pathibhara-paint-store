import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { GuideApi } from "#/features/guides/api";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) =>
    SlugRedirectHelper.loadBySlug("post", params.slug, () =>
      GuideApi.post(params.slug),
    ),
  head: ({ loaderData: post }) =>
    post
      ? SeoHelper.page({
          title: post.seoTitle ?? post.title,
          description: post.seoDescription ?? post.excerpt ?? post.title,
          path: SiteUrlHelper.entityPath("post", post.slug),
          image: post.coverImage?.url,
          noIndex: true,
        })
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const post = Route.useLoaderData();
  return (
    <PagePlaceholder title={post.title} description={post.excerpt ?? ""} />
  );
}
