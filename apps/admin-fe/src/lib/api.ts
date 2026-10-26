import type { IApiError } from "#/types/api.types";

import { AUTH_API_PATHS, AUTH_COOKIE_NAME } from "#/features/auth/constants";
import { ApiError } from "#/lib/apiError";
import { Config } from "#/lib/config";
import { cookieHelper } from "#/lib/helpers/cookies.helper";

export class ApiClient {
  /**
   * Set by the auth feature. Returns the access token to attach to a request
   * (refreshing it proactively if it's about to expire), or null when anonymous.
   * Kept as a hook so the transport layer stays decoupled from auth (no import
   * cycle); falls back to reading the cookie directly when unset.
   */
  static getAuthToken: (() => Promise<string | null>) | null = null;

  /**
   * Set by the auth feature. On a 401 the client invokes this once to refresh
   * the access token; it returns the new token to retry the request with, or
   * null if the refresh wasn't possible.
   */
  static onUnauthorized: (() => Promise<string | null>) | null = null;

  private static buildUrl(path: string): string {
    return `${Config.api.baseUrl}${path}`;
  }

  // Login and refresh opt out of the refresh hooks: a 401 there means bad
  // credentials or a dead refresh token, and refreshing on `refresh` would recurse.
  private static isAuthPath(path: string): boolean {
    return path === AUTH_API_PATHS.login || path === AUTH_API_PATHS.refresh;
  }

  private static async buildHeaders(
    init?: RequestInit,
    overrideToken?: string,
    skipRefresh = false,
  ): Promise<HeadersInit> {
    const isFormData = init?.body instanceof FormData;
    const baseHeaders: Record<string, string> = {};

    if (!isFormData) baseHeaders["Content-Type"] = "application/json";

    // Retry passes the freshly-minted token explicitly (on the server a cookie
    // re-read would still return the old request cookie). Otherwise the auth
    // hook supplies it — proactively refreshing if needed — falling back to the
    // raw cookie for auth endpoints and when no hook is registered.
    const token =
      overrideToken ??
      (!skipRefresh && ApiClient.getAuthToken
        ? await ApiClient.getAuthToken()
        : await cookieHelper.get(AUTH_COOKIE_NAME));
    if (token) baseHeaders.Authorization = `Bearer ${token}`;

    return { ...baseHeaders, ...(init?.headers as Record<string, string>) };
  }

  private static async request<TResponse>(
    path: string,
    init?: RequestInit,
    retried = false,
    overrideToken?: string,
  ): Promise<TResponse> {
    const skipRefresh = ApiClient.isAuthPath(path);
    const headers = await ApiClient.buildHeaders(
      init,
      overrideToken,
      skipRefresh,
    );

    const response = await fetch(ApiClient.buildUrl(path), {
      ...init,
      headers,
    });

    if (
      response.status === 401 &&
      !retried &&
      !skipRefresh &&
      ApiClient.onUnauthorized
    ) {
      const newToken = await ApiClient.onUnauthorized();
      if (newToken)
        return ApiClient.request<TResponse>(path, init, true, newToken);
    }

    if (!response.ok) {
      const body = (await response.json()) as IApiError;
      throw new ApiError(body, response.status);
    }

    // 204 No Content / 205 Reset Content carry no body. Parsing JSON on an
    // empty stream throws SyntaxError and silently sinks mutations that
    // succeeded on the server — return null to let callers ignore the body.
    if (response.status === 204 || response.status === 205) {
      return null as TResponse;
    }

    return response.json() as Promise<TResponse>;
  }

  static get<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
    return ApiClient.request<TResponse>(path, init);
  }

  static post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    const payload = body instanceof FormData ? body : JSON.stringify(body);
    return ApiClient.request<TResponse>(path, {
      ...init,
      method: "POST",
      body: payload as BodyInit,
    });
  }

  static put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    return ApiClient.request<TResponse>(path, {
      ...init,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    const payload = body instanceof FormData ? body : JSON.stringify(body);
    return ApiClient.request<TResponse>(path, {
      ...init,
      method: "PATCH",
      body: payload as BodyInit,
    });
  }

  static delete<TResponse>(
    path: string,
    init?: RequestInit,
  ): Promise<TResponse> {
    return ApiClient.request<TResponse>(path, {
      ...init,
      method: "DELETE",
    });
  }
}
