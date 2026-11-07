export interface ISiteConfig {
  name: string;
  url: string;
  description: string;
}

export interface IApiConfig {
  baseUrl: string;
}

export interface IOpeningHours {
  days: string;
  hours: string;
  // schema.org days, for search engines, e.g. ["Sunday", "Monday"]. Empty
  // for rows that aren't a fixed weekly time, like public holidays.
  schemaDays: Array<string>;
  // 24-hour "HH:MM"; null when closed or not a fixed time.
  opens: string | null;
  closes: string | null;
}

export interface IStoreConfig {
  // False while the details below are placeholders: the Visit page stays out
  // of search results and the sitemap, and no LocalBusiness data is sent.
  isConfirmed: boolean;
  city: string;
  address: string;
  // One line for tight spots (Home, footer).
  openingHours: string;
  // The full table on the Visit page.
  hours: Array<IOpeningHours>;
  landmark: string;
  parking: string;
  // Shown to people, e.g. "+977 98XXXXXXXX".
  phoneDisplay: string;
  // E.164 without spaces, used in tel: links.
  phone: string;
  whatsappDisplay: string;
  // Digits only, country code first, as wa.me expects.
  whatsappNumber: string;
  mapUrl: string;
  // Google Maps' "Embed a map" src; null shows a link instead of a map.
  mapEmbedUrl: string | null;
}
