import type { SlugEntityType } from "@repo/shared";

import { notFound, redirect } from "@tanstack/react-router";

import { ApiError } from "#/lib/apiError";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

import { SeoApi } from "../api";

export class SlugRedirectHelper {
  // For a slugged page's loader. When the record isn't found under this slug,
  // an old slug answers with a 301 to the current URL (keeping search
  // rankings and shared links working); anything else is a real 404.
  static async loadBySlug<TData>(
    type: SlugEntityType,
    slug: string,
    load: () => Promise<TData>,
  ): Promise<TData> {
    try {
      return await load();
    } catch (error) {
      if (!ApiError.isNotFound(error)) throw error;
    }

    const currentSlug = await SeoApi.currentSlug(type, slug);
    if (currentSlug) {
      throw redirect({
        href: SiteUrlHelper.entityPath(type, currentSlug),
        statusCode: 301,
      });
    }
    throw notFound();
  }
}
