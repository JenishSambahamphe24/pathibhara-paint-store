import type { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { NotFound } from "#/components/NotFound/NotFound";
import { AppToaster } from "#/components/Toaster/Toaster";

import { authGuard } from "#/features/auth/authGuard";
import { TanstackDevtoolHandler } from "#/integrations/tanstackDevtools/Devtools";
import { getLocale } from "#/paraglide/runtime";

import { AppLayout } from "#/layouts/AppLayout";

import "#/styles/global.css";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFound,
  beforeLoad: async ({ location }) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }

    return await authGuard.apply({ location });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Pathibhara Paints Admin" },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

// The shell is the only part the server renders (SSR is off in `start.ts`);
// everything inside `children` mounts client-side, so it can't mismatch.
function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body
        className="font-sans wrap-anywhere antialiased"
        suppressHydrationWarning
      >
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AppLayout />
      <AppToaster />
      <TanstackDevtoolHandler />
    </>
  );
}
