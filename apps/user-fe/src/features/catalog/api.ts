import type {
  IPublicCategory,
  IPublicProduct,
  IPublicProductListItem,
} from "./types";
import type { IApiResponse, IPaginatedApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class CatalogApi {
  static async products(
    perPage: number,
  ): Promise<Array<IPublicProductListItem>> {
    return (
      await ApiClient.get<IPaginatedApiResponse<IPublicProductListItem>>(
        `/public/products?perPage=${perPage}`,
      )
    ).data;
  }

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
