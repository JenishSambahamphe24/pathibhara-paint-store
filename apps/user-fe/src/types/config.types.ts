export interface ISiteConfig {
  name: string;
  url: string;
  description: string;
}

export interface IApiConfig {
  baseUrl: string;
}

export interface IStoreConfig {
  city: string;
  address: string;
  openingHours: string;
  // Shown to people, e.g. "+977 98XXXXXXXX".
  phoneDisplay: string;
  // E.164 without spaces, used in tel: links.
  phone: string;
  // Digits only, country code first, as wa.me expects.
  whatsappNumber: string;
  mapUrl: string;
}
