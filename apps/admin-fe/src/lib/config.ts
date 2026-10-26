import type { IApiConfig, ICookieConfig } from "#/types/config.types";

import { env } from "#/lib/env";

export class Config {
  static get api(): IApiConfig {
    return { baseUrl: env.VITE_API_BASE_URL };
  }

  static get cookie(): ICookieConfig {
    return { domain: env.VITE_COOKIE_DOMAIN };
  }
}
