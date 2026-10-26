import type { IStockMovement } from "./types";
import type { StockMovementListQuery } from "@repo/shared";
import type { IPage, IPaginatedApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class StockMovementApi {
  static async list(
    query: StockMovementListQuery,
  ): Promise<IPage<IStockMovement>> {
    const response = await ApiClient.get<IPaginatedApiResponse<IStockMovement>>(
      `/admin/stock/movements${QueryStringHelper.build(query)}`,
    );
    return { items: response.data, pagination: response.pagination };
  }
}
