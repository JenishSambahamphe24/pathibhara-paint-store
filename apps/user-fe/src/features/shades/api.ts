import type { IPublicShadeListItem } from "./types";
import type { IPaginatedApiResponse } from "#/types/api.types";

import { MAX_PER_PAGE } from "@repo/shared";

import { ApiClient } from "#/lib/api";

export class ShadeApi {
  // Every shade on sale, in code order. The visualizer needs the whole range;
  // the API caps a page at MAX_PER_PAGE, so this walks the pages.
  static async all(): Promise<Array<IPublicShadeListItem>> {
    const shades: Array<IPublicShadeListItem> = [];
    for (let page = 1; ; page++) {
      const response = await ApiClient.get<
        IPaginatedApiResponse<IPublicShadeListItem>
      >(`/public/shades?perPage=${MAX_PER_PAGE}&page=${page}`);
      shades.push(...response.data);
      if (page >= response.pagination.totalPages) return shades;
    }
  }
}
