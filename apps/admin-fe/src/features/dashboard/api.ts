import type { IDashboard } from "./types";
import type { IApiResponse } from "#/types/api.types";
import type { DashboardQuery } from "@repo/shared";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class DashboardApi {
  static async get(query: DashboardQuery): Promise<IDashboard> {
    const response = await ApiClient.get<IApiResponse<IDashboard>>(`/admin/dashboard${QueryStringHelper.build(query)}`);
    return response.data;
  }
}
