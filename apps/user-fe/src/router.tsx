import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    // The page brings its own full-screen chrome, so SiteLayout leaves out the
    // header, footer and contact bar (the visualizer).
    fullScreen?: boolean;
    // The page shows its own bottom bar on phones instead of the contact bar
    // (the calculator's running total).
    hideContactBar?: boolean;
  }
}
