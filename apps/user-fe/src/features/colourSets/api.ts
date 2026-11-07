import type { IPublicColourSet } from "./types";
import type { IApiResponse, IPaginatedApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class ColourSetApi {
  static async list(perPage: number): Promise<Array<IPublicColourSet>> {
    return (
      await ApiClient.get<IPaginatedApiResponse<IPublicColourSet>>(
        `/public/colour-sets?perPage=${perPage}`,
      )
    ).data;
  }

  static async colourSet(slug: string): Promise<IPublicColourSet> {
    return (
      await ApiClient.get<IApiResponse<IPublicColourSet>>(
        `/public/colour-sets/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
