import type { IStockAdjustment } from "./types";
import type {
  StockAdjustmentInput,
  StockAdjustmentListQuery,
} from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class StockAdjustmentApi {
  static async list(
    query: StockAdjustmentListQuery,
  ): Promise<IPage<IStockAdjustment>> {
    const response = await ApiClient.get<
      IPaginatedApiResponse<IStockAdjustment>
    >(`/admin/stock/adjustments${QueryStringHelper.build(query)}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async create(body: StockAdjustmentInput): Promise<IStockAdjustment> {
    return (
      await ApiClient.post<IApiResponse<IStockAdjustment>>(
        "/admin/stock/adjustments",
        body,
      )
    ).data;
  }
}
