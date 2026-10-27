import type { IColourSet, IColourSetListItem } from "./types";
import type { ColourSetInput, ColourSetListQuery } from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class ColourSetApi {
  static async list(
    query: ColourSetListQuery,
  ): Promise<IPage<IColourSetListItem>> {
    const response = await ApiClient.get<
      IPaginatedApiResponse<IColourSetListItem>
    >(`/admin/colour-sets${QueryStringHelper.build(query)}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async get(id: string): Promise<IColourSet> {
    return (
      await ApiClient.get<IApiResponse<IColourSet>>(`/admin/colour-sets/${id}`)
    ).data;
  }

  static async create(body: ColourSetInput): Promise<IColourSet> {
    return (
      await ApiClient.post<IApiResponse<IColourSet>>("/admin/colour-sets", body)
    ).data;
  }

  static async update(id: string, body: ColourSetInput): Promise<IColourSet> {
    return (
      await ApiClient.put<IApiResponse<IColourSet>>(
        `/admin/colour-sets/${id}`,
        body,
      )
    ).data;
  }
}
