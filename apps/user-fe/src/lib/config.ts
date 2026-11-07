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
      isConfirmed: false,
      city: "[CITY]",
      address: "[ADDRESS]",
      openingHours: "[DAYS] · [HOURS]",
      hours: [
        {
          days: "Sunday – Friday",
          hours: "[OPEN] – [CLOSE]",
          schemaDays: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          opens: null,
          closes: null,
        },
        {
          days: "Saturday",
          hours: "[SATURDAY HOURS]",
          schemaDays: ["Saturday"],
          opens: null,
          closes: null,
        },
        {
          days: "Public holidays",
          hours: "[HOLIDAY HOURS]",
          schemaDays: [],
          opens: null,
          closes: null,
        },
      ],
      landmark: "[NEAREST LANDMARK]",
      parking: "[PARKING NOTE]",
      phoneDisplay: "[PHONE]",
      phone: "[PHONE]",
      whatsappDisplay: "[WHATSAPP NUMBER]",
      whatsappNumber: "[WHATSAPP]",
      mapUrl: "https://maps.google.com/?q=Pathibhara+Paints",
      mapEmbedUrl: null,
    };
  }
}
