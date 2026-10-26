import type { IAccessExpiry } from "./cookies/accessExpiryCookies";

import { createIsomorphicFn } from "@tanstack/react-start";

import { AuthApi } from "./api";
import { accessExpiryCookies } from "./cookies/accessExpiryCookies";
import { authCookies } from "./cookies/authCookies";
import { refreshTokenCookies } from "./cookies/refreshTokenCookies";
import { AuthSession } from "./session.helper";

// Refresh up to this many ms before the access token expires, to absorb clock
// skew and in-flight request latency — but never more than half the token's
// lifetime, so a short TTL can't make every request "expiring soon".
const REFRESH_SKEW_MS = 60_000;

// Client-only single-flight: every concurrent caller awaits the same refresh, so
// a burst of 401s triggers one refresh, not one per request — which also matters
// because the API rotates the refresh token, so a second concurrent refresh would
// fail. Module-global on the client (one admin per tab) and absent on the server,
// where each request refreshes in isolation with no shared state.
let clientInFlight: Promise<string | null> | null = null;

// The refresh token that just failed. A cookie the app cannot delete — one
// written for a domain this build doesn't own, e.g. by another environment
// sharing the parent domain — would otherwise be re-read and re-sent on every
// request, turning one dead session into a permanent 401 storm against
// /auth/refresh. Keyed by value, so a genuinely new token still refreshes.
let deadRefreshToken: string | null = null;

const singleFlight = createIsomorphicFn()
  .client((run: () => Promise<string | null>): Promise<string | null> => {
    if (clientInFlight) return clientInFlight;
    clientInFlight = (async () => {
      try {
        return await run();
      } finally {
        clientInFlight = null;
      }
    })();
    return clientInFlight;
  })
  .server((run: () => Promise<string | null>): Promise<string | null> => run());

const redirectLogin = createIsomorphicFn()
  .client((): void => {
    // Full navigation: wipes the in-memory query cache too, so no stale
    // per-admin data survives the session ending.
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  })
  .server((): void => {
    // SSR: the root beforeLoad (authGuard) already redirects to /login when the
    // session can't be resolved.
  });

/**
 * Owns the access-token lifecycle for ApiClient: proactive refresh before
 * expiry, single-flight reactive refresh on 401, and session teardown when the
 * refresh token is gone/invalid (clear cookies, send the admin to /login).
 */
export class TokenRefreshHelper {
  /**
   * The access token to attach to a request, refreshing first if it's expiring.
   * Returns null when anonymous, or when a needed refresh failed.
   */
  static async ensureFreshToken(): Promise<string | null> {
    const token = await authCookies.get();
    if (!token) return null;
    if (!(await TokenRefreshHelper.isExpiringSoon())) return token;

    // Expiring/expired: refresh if we can, otherwise hand back the current token
    // and let the reactive 401 path deal with it.
    if (!(await refreshTokenCookies.has())) return token;
    return TokenRefreshHelper.refresh();
  }

  /**
   * Exchange the refresh token for a new pair (single-flight). Returns the new
   * access token, null if there's nothing to refresh or it failed.
   */
  static refresh(): Promise<string | null> {
    return singleFlight(async () => {
      const refreshToken = await refreshTokenCookies.get();
      // Nothing to refresh with: tear the session down rather than leaving the
      // admin on a page that 401s forever.
      if (!refreshToken) {
        await AuthSession.clear();
        redirectLogin();
        return null;
      }
      if (refreshToken === deadRefreshToken) return null;

      try {
        const tokens = await AuthApi.refresh({ refreshToken });
        await AuthSession.store(tokens);
        return tokens.accessToken;
      } catch {
        // The API rotates the refresh token, so another tab/SSR may have already
        // rotated it out from under us. If the stored token changed since we read
        // it, the session is still alive — use the current access token rather
        // than logging the admin out.
        const current = await refreshTokenCookies.get();
        if (current && current !== refreshToken) {
          return (await authCookies.get()) ?? null;
        }
        deadRefreshToken = refreshToken;
        await AuthSession.clear();
        redirectLogin();
        return null;
      }
    });
  }

  /**
   * How long until the access token should be refreshed: 0 when it's already
   * due, null when the expiry is unknown and only the reactive 401 path can
   * help. Lets a caller schedule the refresh instead of waiting for a request
   * to trigger it — an idle tab would otherwise sail past expiry untouched.
   */
  static async msUntilRefresh(): Promise<number | null> {
    const expiry = await accessExpiryCookies.get();
    if (expiry === null) return null;
    const refreshAt = expiry.expiresAt - TokenRefreshHelper.skewFor(expiry);
    return Math.max(0, refreshAt - Date.now());
  }

  private static async isExpiringSoon(): Promise<boolean> {
    const due = await TokenRefreshHelper.msUntilRefresh();
    // Unknown expiry: skip proactive refresh and rely on the reactive 401 path.
    if (due === null) return false;
    return due === 0;
  }

  private static skewFor(expiry: IAccessExpiry): number {
    return expiry.ttlMs
      ? Math.min(REFRESH_SKEW_MS, expiry.ttlMs / 2)
      : REFRESH_SKEW_MS;
  }
}
