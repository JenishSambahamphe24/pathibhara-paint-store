import type { IPublicPost, IPublicPostListItem } from "./types";
import type { IApiResponse, IPaginatedApiResponse } from "#/types/api.types";

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

  static async post(slug: string): Promise<IPublicPost> {
    return (
      await ApiClient.get<IApiResponse<IPublicPost>>(
        `/public/posts/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
