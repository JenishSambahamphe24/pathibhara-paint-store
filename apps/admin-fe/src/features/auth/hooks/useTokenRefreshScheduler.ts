import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";

import { authStore } from "../store/authStore";
import { TokenRefreshHelper } from "../tokenRefresh.helper";

// setTimeout coerces delays past ~24.8 days to fire immediately, and a very long
// sleep is worth re-checking against the clock anyway. Wake up at least this
// often and recompute.
const MAX_SLEEP_MS = 10 * 60 * 1000;

// ApiClient's hooks only run on a request, so an idle tab would sail past
// expiry; this refreshes at expiry instead. The reactive 401 path stays as the
// backstop.
export function useTokenRefreshScheduler(): void {
  const isAuthenticated = useStore(authStore, (s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    function clear() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    // Read through a call, not the property directly: narrowing on
    // `signal.aborted` survives the awaits below, so a repeated inline check
    // reads as statically false.
    function isCancelled(): boolean {
      return controller.signal.aborted;
    }

    async function schedule() {
      if (isCancelled()) return;
      const due = await TokenRefreshHelper.msUntilRefresh();
      // Unknown expiry — nothing to schedule against; the 401 path covers it.
      if (isCancelled() || due === null) return;

      if (due === 0) {
        // A failed refresh tears the session down and redirects on its own, so
        // there's nothing to reschedule against here.
        const token = await TokenRefreshHelper.refresh();
        if (isCancelled() || !token) return;
        void schedule();
        return;
      }

      timer = setTimeout(() => void schedule(), Math.min(due, MAX_SLEEP_MS));
    }

    // A backgrounded tab gets its timers throttled, so the wake-up can land well
    // after expiry. Recompute whenever the tab comes back to the foreground.
    function handleVisibility() {
      if (document.visibilityState !== "visible") return;
      clear();
      void schedule();
    }

    void schedule();
    document.addEventListener("visibilitychange", handleVisibility, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
      clear();
    };
  }, [isAuthenticated]);
}
