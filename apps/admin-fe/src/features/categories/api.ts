import type { ICategory } from "./types";
import type { CategoryInput, CategoryReorderInput } from "@repo/shared";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class CategoryApi {
  static async list(): Promise<Array<ICategory>> {
    return (
      await ApiClient.get<IApiResponse<Array<ICategory>>>("/admin/categories")
    ).data;
  }

  static async create(body: CategoryInput): Promise<ICategory> {
    return (
      await ApiClient.post<IApiResponse<ICategory>>("/admin/categories", body)
    ).data;
  }

  static async update(id: string, body: CategoryInput): Promise<ICategory> {
    return (
      await ApiClient.put<IApiResponse<ICategory>>(
        `/admin/categories/${id}`,
        body,
      )
    ).data;
  }

  static async reorder(body: CategoryReorderInput): Promise<Array<ICategory>> {
    return (
      await ApiClient.post<IApiResponse<Array<ICategory>>>(
        "/admin/categories/reorder",
        body,
      )
    ).data;
  }

  static async remove(id: string): Promise<void> {
    await ApiClient.delete(`/admin/categories/${id}`);
  }
}
