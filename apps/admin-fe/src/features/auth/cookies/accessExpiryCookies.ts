import { cookieHelper } from "#/lib/helpers/cookies.helper";

import { ACCESS_EXPIRES_AT_COOKIE } from "../constants";
import { SessionCookieHelper } from "./sessionCookie.helper";

export interface IAccessExpiry {
  expiresAt: number;
  ttlMs: number | null;
}

export class accessExpiryCookies {
  static async get(): Promise<IAccessExpiry | null> {
    const raw = await cookieHelper.get(ACCESS_EXPIRES_AT_COOKIE);
    if (!raw) return null;
    const [expiresRaw, ttlRaw] = raw.split(":");
    const expiresAt = Number(expiresRaw);
    if (!Number.isFinite(expiresAt)) return null;
    const ttlMs = Number(ttlRaw);
    return { expiresAt, ttlMs: Number.isFinite(ttlMs) ? ttlMs : null };
  }

  static async set(expiresAt: number, ttlMs: number): Promise<void> {
    return cookieHelper.set(
      ACCESS_EXPIRES_AT_COOKIE,
      `${expiresAt}:${ttlMs}`,
      SessionCookieHelper.options(),
    );
  }

  static async remove(): Promise<void> {
    return cookieHelper.remove(
      ACCESS_EXPIRES_AT_COOKIE,
      "/",
      SessionCookieHelper.domain,
    );
  }
}
