import type { IShade, IShadeListItem } from "./types";
import type { ShadeInput, ShadeListQuery } from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class ShadeApi {
  static async list(
    query: Partial<ShadeListQuery>,
  ): Promise<IPage<IShadeListItem>> {
    const response = await ApiClient.get<IPaginatedApiResponse<IShadeListItem>>(
      `/admin/shades${QueryStringHelper.build(query)}`,
    );
    return { items: response.data, pagination: response.pagination };
  }

  static async get(id: string): Promise<IShade> {
    return (await ApiClient.get<IApiResponse<IShade>>(`/admin/shades/${id}`))
      .data;
  }

  static async create(body: ShadeInput): Promise<IShade> {
    return (await ApiClient.post<IApiResponse<IShade>>("/admin/shades", body))
      .data;
  }

  static async update(id: string, body: ShadeInput): Promise<IShade> {
    return (
      await ApiClient.put<IApiResponse<IShade>>(`/admin/shades/${id}`, body)
    ).data;
  }

  static async remove(id: string): Promise<void> {
    await ApiClient.delete(`/admin/shades/${id}`);
  }
}
