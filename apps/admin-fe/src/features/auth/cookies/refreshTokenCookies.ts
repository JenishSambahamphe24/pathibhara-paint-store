import { cookieHelper } from "#/lib/helpers/cookies.helper";

import { REFRESH_COOKIE_NAME } from "../constants";
import { SessionCookieHelper } from "./sessionCookie.helper";

export class refreshTokenCookies {
  static async get(): Promise<string | undefined> {
    return cookieHelper.get(REFRESH_COOKIE_NAME);
  }

  static async has(): Promise<boolean> {
    return cookieHelper.has(REFRESH_COOKIE_NAME);
  }

  static async set(value: string): Promise<void> {
    return cookieHelper.set(
      REFRESH_COOKIE_NAME,
      value,
      SessionCookieHelper.options(),
    );
  }

  static async remove(): Promise<void> {
    return cookieHelper.remove(
      REFRESH_COOKIE_NAME,
      "/",
      SessionCookieHelper.domain,
    );
  }
}
