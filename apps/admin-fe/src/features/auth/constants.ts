export const AUTH_PATHS = new Set(["/login", "/login/"]);

export const AUTH_COOKIE_NAME = "access_token" as const;

export const REFRESH_COOKIE_NAME = "refresh_token" as const;

// Epoch-ms timestamp of when the access token expires; drives proactive refresh.
export const ACCESS_EXPIRES_AT_COOKIE = "access_expires_at" as const;

export const AUTH_API_PATHS = {
  login: "/admin/auth/login",
  refresh: "/admin/auth/refresh",
  logout: "/admin/auth/logout",
  me: "/admin/auth/me",
} as const;
