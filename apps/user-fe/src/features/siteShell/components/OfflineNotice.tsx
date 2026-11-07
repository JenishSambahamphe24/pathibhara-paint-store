import { clsx } from "clsx";
import { WifiOff } from "lucide-react";

import { useIsOnline } from "#/hooks/useIsOnline";

interface OfflineNoticeProps {
  // Floats over a full-screen page instead of pushing it down.
  overlay?: boolean;
}

// Shown on every page while the phone has no connection. There's no offline
// cache, so only what's already on screen keeps working.
export function OfflineNotice({ overlay = false }: OfflineNoticeProps) {
  const isOnline = useIsOnline();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className={clsx(
        "z-40 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-on-ink print:hidden",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <WifiOff size={16} aria-hidden="true" />
      You’re offline. This page still works; new pages load when you’re back.
    </div>
  );
}
