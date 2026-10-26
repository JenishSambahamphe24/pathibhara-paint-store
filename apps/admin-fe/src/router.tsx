import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import "#/features/auth/setupRefresh";

import { TanStackQueryProvider } from "./integrations/tanstackQuery/RootProvider";
import { routeTree } from "./routeTree.gen";

// Called once per request on the server and once on the client, so each SSR
// request gets its own QueryClient and cached data never leaks between them.
export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    Wrap: (props: { children: React.ReactNode }) => (
      <TanStackQueryProvider queryClient={queryClient}>
        {props.children}
      </TanStackQueryProvider>
    ),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    // Fills the content area edge to edge: no page padding, no outer scroll.
    fullBleed?: boolean;
  }
}
