import type { IDailySale, IDailySaleDetail } from "./types";
import type { DailySaleInput, DailySaleListQuery } from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { ApiError } from "#/lib/apiError";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class DailySaleApi {
  static async list(query: DailySaleListQuery): Promise<IPage<IDailySale>> {
    const response = await ApiClient.get<IPaginatedApiResponse<IDailySale>>(
      `/admin/stock/daily-sales${QueryStringHelper.build(query)}`,
    );
    return { items: response.data, pagination: response.pagination };
  }

  // null when nothing has been recorded for that date yet.
  static async getByDate(date: string): Promise<IDailySaleDetail | null> {
    try {
      return (
        await ApiClient.get<IApiResponse<IDailySaleDetail>>(
          `/admin/stock/daily-sales/${date}`,
        )
      ).data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  static async save(
    date: string,
    body: DailySaleInput,
  ): Promise<IDailySaleDetail> {
    return (
      await ApiClient.put<IApiResponse<IDailySaleDetail>>(
        `/admin/stock/daily-sales/${date}`,
        body,
      )
    ).data;
  }
}
