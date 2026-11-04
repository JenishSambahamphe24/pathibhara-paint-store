import type { IPublicPost, IPublicPostListItem } from "./types";
import type {
  IApiResponse,
  IPage,
  IPaginatedApiResponse,
} from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class GuideApi {
  // Newest first.
  static async latest(perPage: number): Promise<Array<IPublicPostListItem>> {
    return (
      await ApiClient.get<IPaginatedApiResponse<IPublicPostListItem>>(
        `/public/posts?perPage=${perPage}`,
      )
    ).data;
  }

  static async list(query: {
    perPage: number;
    page: number;
  }): Promise<IPage<IPublicPostListItem>> {
    const response = await ApiClient.get<
      IPaginatedApiResponse<IPublicPostListItem>
    >(`/public/posts?perPage=${query.perPage}&page=${query.page}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async post(slug: string): Promise<IPublicPost> {
    return (
      await ApiClient.get<IApiResponse<IPublicPost>>(
        `/public/posts/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
