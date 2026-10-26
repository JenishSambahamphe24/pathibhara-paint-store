import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Container } from "#/components/Container/Container";

import { useAuthSync } from "#/features/auth/hooks/useAuthSync";
import { useTokenRefreshScheduler } from "#/features/auth/hooks/useTokenRefreshScheduler";
import { Navbar } from "#/features/navbar/components/Navbar";
import { MobileSidebar } from "#/features/sidebar/components/MobileSidebar";
import { Sidebar } from "#/features/sidebar/components/Sidebar";

export function AppLayout() {
  useAuthSync();
  useTokenRefreshScheduler();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    function resetWindowScroll() {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    }
    window.addEventListener("scroll", resetWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", resetWindowScroll);
  }, []);

  const isPublicRoute = useRouterState({
    select: (s) => s.matches.some((m) => m.routeId.startsWith("/(auth)/")),
  });

  const isFullBleed = useRouterState({
    select: (s) => s.matches.some((m) => m.staticData.fullBleed),
  });

  if (isPublicRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      <MobileSidebar
        open={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
      />

      <div className="flex h-screen w-full min-w-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        </div>

        {isFullBleed ? (
          <div className="min-h-0 grow">
            <Outlet />
          </div>
        ) : (
          // Top padding sits inside the scroller: on the scroller itself it
          // insets sticky children, leaving a strip content shows through.
          <div className="scrollbar-slim grow overflow-y-auto px-2 md:px-5">
            <div className="h-full pt-2 md:pt-5">
              <Container>
                <Outlet />
                <div className="h-5" />
              </Container>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
