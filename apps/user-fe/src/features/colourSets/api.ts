import type { IPublicColourSet } from "./types";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class ColourSetApi {
  static async colourSet(slug: string): Promise<IPublicColourSet> {
    return (
      await ApiClient.get<IApiResponse<IPublicColourSet>>(
        `/public/colour-sets/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
