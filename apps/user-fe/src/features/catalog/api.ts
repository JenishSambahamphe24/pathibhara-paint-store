import type {
  IPublicCategory,
  IPublicProduct,
  IPublicProductListItem,
} from "./types";
import type { IApiResponse, IPaginatedApiResponse } from "#/types/api.types";

import { MAX_PER_PAGE } from "@repo/shared";

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

  // Every product on sale, name order: the calculator's product picker.
  static async allProducts(): Promise<Array<IPublicProductListItem>> {
    const products: Array<IPublicProductListItem> = [];
    for (let page = 1; ; page++) {
      const response = await ApiClient.get<
        IPaginatedApiResponse<IPublicProductListItem>
      >(
        `/public/products?perPage=${MAX_PER_PAGE}&page=${page}&sortBy=name&sortOrder=asc`,
      );
      products.push(...response.data);
      if (page >= response.pagination.totalPages) return products;
    }
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
