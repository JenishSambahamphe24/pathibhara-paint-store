import type { IApiError } from "#/types/api.types";

import { ApiError } from "#/lib/apiError";
import { Config } from "#/lib/config";

// The site only reads /public/*, which needs no auth. Route loaders call this
// on the server for the first render and in the browser on navigation.
export class ApiClient {
  static get<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
    return ApiClient.request<TResponse>(path, init);
  }

  static post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    return ApiClient.request<TResponse>(path, {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  private static async request<TResponse>(
    path: string,
    init?: RequestInit,
  ): Promise<TResponse> {
    const response = await fetch(`${Config.api.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!response.ok) {
      // A proxy or crash can answer with HTML; keep the status either way so
      // a 404 still reads as not found.
      const body = (await response
        .json()
        .catch(() => ({ message: response.statusText }))) as IApiError;
      throw new ApiError(body, response.status);
    }

    return response.json() as Promise<TResponse>;
  }
}
