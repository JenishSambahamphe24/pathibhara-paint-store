import type { IProduct, IProductListItem, IVariantSummary } from "./types";
import type {
  ProductInput,
  ProductListQuery,
  VariantSearchQuery,
} from "@repo/shared";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class ProductApi {
  static async list(query: ProductListQuery): Promise<IPage<IProductListItem>> {
    const response = await ApiClient.get<
      IPaginatedApiResponse<IProductListItem>
    >(`/admin/products${QueryStringHelper.build(query)}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async get(id: string): Promise<IProduct> {
    return (
      await ApiClient.get<IApiResponse<IProduct>>(`/admin/products/${id}`)
    ).data;
  }

  static async create(body: ProductInput): Promise<IProduct> {
    return (
      await ApiClient.post<IApiResponse<IProduct>>("/admin/products", body)
    ).data;
  }

  static async update(id: string, body: ProductInput): Promise<IProduct> {
    return (
      await ApiClient.put<IApiResponse<IProduct>>(`/admin/products/${id}`, body)
    ).data;
  }

  static async searchVariants(
    query: Partial<VariantSearchQuery>,
  ): Promise<IPage<IVariantSummary>> {
    const response = await ApiClient.get<
      IPaginatedApiResponse<IVariantSummary>
    >(`/admin/variants${QueryStringHelper.build(query)}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async getVariant(id: string): Promise<IVariantSummary> {
    return (
      await ApiClient.get<IApiResponse<IVariantSummary>>(
        `/admin/variants/${id}`,
      )
    ).data;
  }
}
