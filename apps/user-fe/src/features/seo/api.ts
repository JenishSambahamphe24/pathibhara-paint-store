import type { ISitemapEntry } from "./types";
import type { SlugEntityType } from "@repo/shared";
import type { IApiResponse } from "#/types/api.types";

import { ApiClient } from "#/lib/api";
import { ApiError } from "#/lib/apiError";

export class SeoApi {
  static async sitemap(): Promise<Array<ISitemapEntry>> {
    return (
      await ApiClient.get<IApiResponse<Array<ISitemapEntry>>>("/public/sitemap")
    ).data;
  }

  // The record's current slug, or null when the old one never redirected.
  static async currentSlug(
    type: SlugEntityType,
    slug: string,
  ): Promise<string | null> {
    const query = new URLSearchParams({ type, slug });
    try {
      const response = await ApiClient.get<
        IApiResponse<{ type: SlugEntityType; slug: string }>
      >(`/public/redirects?${query}`);
      return response.data.slug;
    } catch (error) {
      if (ApiError.isNotFound(error)) return null;
      throw error;
    }
  }
}
