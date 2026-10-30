import type {
  IApiConfig,
  ISiteConfig,
  IStoreConfig,
} from "#/types/config.types";

import { env } from "#/lib/env";

export class Config {
  static get site(): ISiteConfig {
    return {
      name: "Pathibhara Paints",
      url: env.VITE_SITE_URL,
      description:
        "Paint and waterproofing store. Try exterior colours on a 3D house, work out how much paint you need, and see sizes and prices.",
    };
  }

  static get api(): IApiConfig {
    return { baseUrl: env.VITE_API_BASE_URL };
  }

  // Placeholders until the client confirms the store's details.
  static get store(): IStoreConfig {
    return {
      city: "[CITY]",
      address: "[ADDRESS]",
      openingHours: "[DAYS] · [HOURS]",
      phoneDisplay: "[PHONE]",
      phone: "[PHONE]",
      whatsappNumber: "[WHATSAPP]",
      mapUrl: "https://maps.google.com/?q=Pathibhara+Paints",
    };
  }
}
