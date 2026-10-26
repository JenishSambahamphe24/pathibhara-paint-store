import type { ICookieOptions } from "#/lib/helpers/cookies.helper";

import { Config } from "#/lib/config";

// Cookies must outlive the access *token* so a reactive refresh can still read
// them; the admin API doesn't expose the refresh TTL, so track the 30-day
// refresh-cookie lifetime.
const SESSION_COOKIE_DAYS = 30;

export class SessionCookieHelper {
  // `Secure` in prod only (keeps local http dev working); `Domain` per-env so
  // the cookie reaches the SSR server on a hard refresh. Not `httpOnly` — the
  // app reads the token to attach it as a Bearer header.
  static options(): ICookieOptions {
    return {
      expires: SESSION_COOKIE_DAYS,
      path: "/",
      sameSite: "Lax",
      secure: import.meta.env.PROD,
      domain: Config.cookie.domain,
    };
  }

  // Removal must pass the same domain — a host-only delete won't clear a
  // domain-scoped cookie.
  static get domain(): string | undefined {
    return Config.cookie.domain;
  }
}
