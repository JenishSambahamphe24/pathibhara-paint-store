import type {
  IPublicCategory,
  IPublicProduct,
  IPublicProductListItem,
} from "./types";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { MAX_PER_PAGE } from "@repo/shared";

import { ApiClient } from "#/lib/api";

export class CatalogApi {
  static async products(query: {
    perPage: number;
    page?: number;
    category?: string;
  }): Promise<IPage<IPublicProductListItem>> {
    const search = new URLSearchParams({ perPage: String(query.perPage) });
    if (query.page) search.set("page", String(query.page));
    if (query.category) search.set("category", query.category);
    const response = await ApiClient.get<
      IPaginatedApiResponse<IPublicProductListItem>
    >(`/public/products?${search}`);
    return { items: response.data, pagination: response.pagination };
  }

  // The whole visible tree, depth-first.
  static async categories(): Promise<Array<IPublicCategory>> {
    return (
      await ApiClient.get<IApiResponse<Array<IPublicCategory>>>(
        "/public/categories",
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
