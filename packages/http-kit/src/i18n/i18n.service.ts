import type { Resource } from "i18next";

import i18next from "i18next";
import { injectable } from "tsyringe";

export interface I18nConfig {
  lng?: string;
  resources?: Resource;
}

@injectable()
export class I18nService {
  private initialized = false;

  async init(config: I18nConfig = {}): Promise<void> {
    if (this.initialized) return;

    const { lng = "en" } = config;

    await i18next.init({
      lng,
      resources: config.resources ?? {},
      interpolation: { escapeValue: false },
    });

    this.initialized = true;
  }

  t(key: string, options?: Record<string, unknown>): string {
    return i18next.t(key, options);
  }
}
