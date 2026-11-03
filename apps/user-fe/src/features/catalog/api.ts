import type { IPublicCategory, IPublicProduct } from "./types";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class CatalogApi {
  static async product(slug: string): Promise<IPublicProduct> {
    return (
      await ApiClient.get<IApiResponse<IPublicProduct>>(
        `/public/products/${encodeURIComponent(slug)}`,
      )
    ).data;
  }

  static async category(slug: string): Promise<IPublicCategory> {
    return (
      await ApiClient.get<IApiResponse<IPublicCategory>>(
        `/public/categories/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
