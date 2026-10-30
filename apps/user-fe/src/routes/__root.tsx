import type { PropsWithChildren } from "react";

import {
  createRootRoute,
  HeadContent,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";

import { NotFound } from "#/components/NotFound/NotFound";

import { Config } from "#/lib/config";
import { ThemeHelper } from "#/lib/helpers/theme.helper";

import { SiteLayout } from "#/layouts/SiteLayout";

import "#/styles/global.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: Config.site.name },
      { name: "description", content: Config.site.description },
      { property: "og:site_name", content: Config.site.name },
      { property: "og:locale", content: "en_US" },
      // Browser chrome matches the red header signboard in both themes.
      { name: "theme-color", content: "#a3192b" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Teko:wght@400..700&family=Mukta:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
  component: SiteLayout,
  notFoundComponent: NotFound,
});

// suppressHydrationWarning: the theme script sets data-theme on <html> before
// React hydrates, so the attribute never matches the server render.
function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{ThemeHelper.initScript}</ScriptOnce>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
