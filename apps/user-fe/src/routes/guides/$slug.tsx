import { createFileRoute } from "@tanstack/react-router";

import { GuideApi } from "#/features/guides/api";
import { ArticlePage } from "#/features/guides/components/ArticlePage";
import { GuideSeoHelper } from "#/features/guides/helpers/guideSeo.helper";
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
      ? {
          ...SeoHelper.page({
            title: post.seoTitle ?? post.title,
            description: post.seoDescription ?? post.excerpt ?? post.title,
            path: SiteUrlHelper.entityPath("post", post.slug),
            image: post.coverImage?.url,
          }),
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify(GuideSeoHelper.jsonLd(post)),
            },
          ],
        }
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  return <ArticlePage post={Route.useLoaderData()} />;
}
