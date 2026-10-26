import { cookieHelper } from "#/lib/helpers/cookies.helper";

import { AUTH_COOKIE_NAME } from "../constants";
import { SessionCookieHelper } from "./sessionCookie.helper";

export class authCookies {
  static async get(): Promise<string | undefined> {
    return cookieHelper.get(AUTH_COOKIE_NAME);
  }

  static async has(): Promise<boolean> {
    return cookieHelper.has(AUTH_COOKIE_NAME);
  }

  static async set(value: string): Promise<void> {
    return cookieHelper.set(
      AUTH_COOKIE_NAME,
      value,
      SessionCookieHelper.options(),
    );
  }

  static async remove(): Promise<void> {
    return cookieHelper.remove(
      AUTH_COOKIE_NAME,
      "/",
      SessionCookieHelper.domain,
    );
  }
}
