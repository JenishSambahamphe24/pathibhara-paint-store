export interface IApiConfig {
  baseUrl: string;
}

export interface ICookieConfig {
  // Undefined means host-only cookies.
  domain?: string;
}
