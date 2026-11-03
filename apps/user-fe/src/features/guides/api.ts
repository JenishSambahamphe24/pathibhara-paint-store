import type { IPublicPost } from "./types";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";

export class GuideApi {
  static async post(slug: string): Promise<IPublicPost> {
    return (
      await ApiClient.get<IApiResponse<IPublicPost>>(
        `/public/posts/${encodeURIComponent(slug)}`,
      )
    ).data;
  }
}
