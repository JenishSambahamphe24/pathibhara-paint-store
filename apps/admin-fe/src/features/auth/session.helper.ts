import type { IAuthTokens } from "./types";

import { accessExpiryCookies } from "./cookies/accessExpiryCookies";
import { authCookies } from "./cookies/authCookies";
import { refreshTokenCookies } from "./cookies/refreshTokenCookies";

export class AuthSession {
  static async store(tokens: IAuthTokens): Promise<void> {
    const ttlMs = tokens.expiresIn * 1000;
    // Evict every scope first: a same-named cookie at another scope (host-only
    // vs domain-scoped) is a separate jar entry the browser keeps sending, and
    // refreshing with it would 401 moments after a successful login.
    await AuthSession.clear();
    await authCookies.set(tokens.accessToken);
    await refreshTokenCookies.set(tokens.refreshToken);
    await accessExpiryCookies.set(Date.now() + ttlMs, ttlMs);
  }

  static async clear(): Promise<void> {
    await authCookies.remove();
    await refreshTokenCookies.remove();
    await accessExpiryCookies.remove();
  }
}
