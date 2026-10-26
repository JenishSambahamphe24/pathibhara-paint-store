import type { IApiResponse } from "#/types/api.types";
import type { IFile } from "#/types/content.types";

import { ApiClient } from "#/lib/api";

export type TUploadPrefix = "products" | "categories" | "posts";

export class FileApi {
  static async uploadImage(
    file: File,
    prefix: TUploadPrefix,
    altText?: string,
  ): Promise<IFile> {
    const body = new FormData();
    body.append("prefix", prefix);
    if (altText) body.append("altText", altText);
    body.append("file", file);
    return (
      await ApiClient.post<IApiResponse<IFile>, FormData>(
        "/admin/files/images",
        body,
      )
    ).data;
  }
}
