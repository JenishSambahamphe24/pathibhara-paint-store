import type { IAuthAdmin, IAuthTokens } from "./types";
import type { AdminLoginInput, RefreshTokenInput } from "@repo/shared";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

import { AUTH_API_PATHS } from "./constants";

export class AuthApi {
  static async login(body: AdminLoginInput): Promise<IAuthTokens> {
    const response = await ApiClient.post<
      IApiResponse<IAuthTokens>,
      AdminLoginInput
    >(AUTH_API_PATHS.login, body);
    return response.data;
  }

  static async refresh(body: RefreshTokenInput): Promise<IAuthTokens> {
    const response = await ApiClient.post<
      IApiResponse<IAuthTokens>,
      RefreshTokenInput
    >(AUTH_API_PATHS.refresh, body);
    return response.data;
  }

  static async logout(): Promise<void> {
    await ApiClient.post<null, Record<string, never>>(
      AUTH_API_PATHS.logout,
      {},
    );
  }

  static async getMe(): Promise<IAuthAdmin> {
    const response = await ApiClient.get<IApiResponse<IAuthAdmin>>(
      AUTH_API_PATHS.me,
    );
    return response.data;
  }
}
