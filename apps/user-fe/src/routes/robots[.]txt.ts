import { createFileRoute } from "@tanstack/react-router";

import { SeoHelper } from "#/lib/helpers/seo.helper";

// Served by a route rather than public/ because the Sitemap line needs the
// absolute site URL, which differs per environment.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            "User-agent: *",
            "Allow: /",
            "",
            `Sitemap: ${SeoHelper.absoluteUrl("/sitemap.xml")}`,
          ].join("\n"),
          { headers: { "Content-Type": "text/plain; charset=utf-8" } },
        ),
    },
  },
});
