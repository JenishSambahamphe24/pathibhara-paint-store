import type { CostEstimateInput, ICostEstimateResult } from "@repo/shared";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class CalculatorApi {
  static async defaults(): Promise<{ wastagePercent: number }> {
    return (
      await ApiClient.get<IApiResponse<{ wastagePercent: number }>>(
        "/admin/calculator/defaults",
      )
    ).data;
  }

  static async estimate(body: CostEstimateInput): Promise<ICostEstimateResult> {
    return (
      await ApiClient.post<IApiResponse<ICostEstimateResult>>(
        "/admin/calculator/estimate",
        body,
      )
    ).data;
  }
}
