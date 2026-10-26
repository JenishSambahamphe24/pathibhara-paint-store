import type { IStockBatch, IStockBatchDetail } from "./types";
import type {
  StockBatchInput,
  StockBatchListQuery,
  StockBatchVoidInput,
} from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class StockBatchApi {
  static async list(query: StockBatchListQuery): Promise<IPage<IStockBatch>> {
    const response = await ApiClient.get<IPaginatedApiResponse<IStockBatch>>(
      `/admin/stock/batches${QueryStringHelper.build(query)}`,
    );
    return { items: response.data, pagination: response.pagination };
  }

  static async get(id: string): Promise<IStockBatchDetail> {
    return (
      await ApiClient.get<IApiResponse<IStockBatchDetail>>(
        `/admin/stock/batches/${id}`,
      )
    ).data;
  }

  static async create(body: StockBatchInput): Promise<IStockBatchDetail> {
    return (
      await ApiClient.post<IApiResponse<IStockBatchDetail>>(
        "/admin/stock/batches",
        body,
      )
    ).data;
  }

  static async void(
    id: string,
    body: StockBatchVoidInput,
  ): Promise<IStockBatchDetail> {
    return (
      await ApiClient.post<IApiResponse<IStockBatchDetail>>(
        `/admin/stock/batches/${id}/void`,
        body,
      )
    ).data;
  }
}
