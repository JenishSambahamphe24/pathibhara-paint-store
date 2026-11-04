import type { IEstimateResult } from "./types";
import type { CostEstimateInput } from "@repo/shared";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class CalculatorApi {
  static async defaultWastagePercent(): Promise<number> {
    return (
      await ApiClient.get<IApiResponse<{ wastagePercent: number }>>(
        "/public/calculator/defaults",
      )
    ).data.wastagePercent;
  }

  static async estimate(
    input: CostEstimateInput,
    signal: AbortSignal,
  ): Promise<IEstimateResult> {
    return (
      await ApiClient.post<IApiResponse<IEstimateResult>>(
        "/public/calculator/estimate",
        input,
        { signal },
      )
    ).data;
  }
}
