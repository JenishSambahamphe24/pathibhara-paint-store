import { createIsomorphicFn } from "@tanstack/react-start";

export interface ICookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

const _get = createIsomorphicFn()
  .client(async (name: string): Promise<string | undefined> => {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  })
  .server(async (name: string): Promise<string | undefined> => {
    const { getCookie } = await import("@tanstack/react-start/server");
    return getCookie(name);
  });

const _set = createIsomorphicFn()
  .client(
    async (
      name: string,
      value: string,
      options: ICookieOptions = {},
    ): Promise<void> => {
      const expires =
        typeof options.expires === "number"
          ? new Date(Date.now() + options.expires * 864e5)
          : options.expires;

      let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      if (expires) cookie += `; expires=${expires.toUTCString()}`;
      cookie += `; path=${options.path ?? "/"}`;
      if (options.domain) cookie += `; domain=${options.domain}`;
      if (options.secure) cookie += "; Secure";
      if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
      document.cookie = cookie;
    },
  )
  .server(
    async (
      name: string,
      value: string,
      options: ICookieOptions = {},
    ): Promise<void> => {
      const { setCookie } = await import("@tanstack/react-start/server");
      const expires =
        typeof options.expires === "number"
          ? new Date(Date.now() + options.expires * 864e5)
          : options.expires;

      setCookie(name, value, {
        expires,
        path: options.path ?? "/",
        domain: options.domain,
        secure: options.secure,
        sameSite: options.sameSite?.toLowerCase() as
          | "strict"
          | "lax"
          | "none"
          | undefined,
      });
    },
  );

/**
 * A delete only matches a cookie with the same name, path AND domain, so a
 * domain-scoped delete leaves a host-only cookie of the same name sitting in
 * the jar — and vice versa. Both variants exist in the wild: sessions written
 * before the cookies were domain-scoped are host-only, later ones carry the
 * env's domain. Missing one is not cosmetic: the stale value keeps being read,
 * every refresh with it 401s, and the app can't clear its way out — the user
 * has to clear cookies by hand. So expire every scope the app could have
 * written, not just the one it writes today.
 */
function removalScopes(domain?: string): Array<string | undefined> {
  if (!domain) return [undefined];
  const bare = domain.startsWith(".") ? domain.slice(1) : domain;
  return [undefined, domain, `.${bare}`, bare];
}

const _remove = createIsomorphicFn()
  .client(async (name: string, path = "/", domain?: string): Promise<void> => {
    for (const scope of removalScopes(domain)) {
      let cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
      if (scope) cookie += `; domain=${scope}`;
      document.cookie = cookie;
    }
  })
  .server(async (name: string, path = "/", domain?: string): Promise<void> => {
    const { deleteCookie } = await import("@tanstack/react-start/server");
    for (const scope of removalScopes(domain)) {
      deleteCookie(name, { path, domain: scope });
    }
  });

const _getAll = createIsomorphicFn()
  .client(async (): Promise<Record<string, string>> => {
    return document.cookie
      .split(";")
      .reduce<Record<string, string>>((acc, pair) => {
        const [key, val] = pair.trim().split("=");
        if (key) acc[decodeURIComponent(key)] = decodeURIComponent(val);
        return acc;
      }, {});
  })
  .server(async (): Promise<Record<string, string>> => {
    const { getCookies } = await import("@tanstack/react-start/server");
    return getCookies();
  });

export class cookieHelper {
  static fromString(cookieString: string, name: string): string | undefined {
    const match = cookieString.match(
      new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  static async get(name: string): Promise<string | undefined> {
    return _get(name);
  }

  static async has(name: string): Promise<boolean> {
    return (await _get(name)) !== undefined;
  }

  static async set(
    name: string,
    value: string,
    options: ICookieOptions = {},
  ): Promise<void> {
    return _set(name, value, options);
  }

  static async remove(
    name: string,
    path = "/",
    domain?: string,
  ): Promise<void> {
    return _remove(name, path, domain);
  }

  static async getAll(): Promise<Record<string, string>> {
    return _getAll();
  }
}
