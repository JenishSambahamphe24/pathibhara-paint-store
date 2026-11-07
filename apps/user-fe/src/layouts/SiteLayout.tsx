import { Outlet, useMatches } from "@tanstack/react-router";

import { ContactBar } from "#/features/siteShell/components/ContactBar";
import { OfflineNotice } from "#/features/siteShell/components/OfflineNotice";
import { SiteFooter } from "#/features/siteShell/components/SiteFooter";
import { SiteHeader } from "#/features/siteShell/components/SiteHeader";

export function SiteLayout() {
  const isFullScreen = useMatches({
    select: (matches) => matches.some((match) => match.staticData.fullScreen),
  });
  const hidesContactBar = useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData.hideContactBar),
  });

  if (isFullScreen) {
    return (
      <main id="main">
        <OfflineNotice overlay />
        <Outlet />
      </main>
    );
  }

  return (
    // The bottom padding below lg is the height of the mobile bottom bar (the
    // ContactBar, or the page's own that replaces it).
    <div className="flex min-h-dvh flex-col pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-on-ink"
      >
        Skip to content
      </a>
      <OfflineNotice />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      {!hidesContactBar && <ContactBar />}
    </div>
  );
}
