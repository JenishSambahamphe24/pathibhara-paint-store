import type { IPost, IPostListItem } from "./types";
import type { IApiResponse, IPage, IPaginatedApiResponse } from "#/types/api.types";
import type { PostInput, PostListQuery } from "@repo/shared";

import { ApiClient } from "#/lib/api";
import { QueryStringHelper } from "#/lib/helpers/queryString.helper";

export class PostApi {
  static async list(query: PostListQuery): Promise<IPage<IPostListItem>> {
    const response = await ApiClient.get<IPaginatedApiResponse<IPostListItem>>(`/admin/posts${QueryStringHelper.build(query)}`);
    return { items: response.data, pagination: response.pagination };
  }

  static async get(id: string): Promise<IPost> {
    return (await ApiClient.get<IApiResponse<IPost>>(`/admin/posts/${id}`)).data;
  }

  static async create(body: PostInput): Promise<IPost> {
    return (await ApiClient.post<IApiResponse<IPost>>("/admin/posts", body)).data;
  }

  static async update(id: string, body: PostInput): Promise<IPost> {
    return (await ApiClient.put<IApiResponse<IPost>>(`/admin/posts/${id}`, body)).data;
  }

  static async publish(id: string): Promise<IPost> {
    return (await ApiClient.post<IApiResponse<IPost>>(`/admin/posts/${id}/publish`, {})).data;
  }

  static async unpublish(id: string): Promise<IPost> {
    return (await ApiClient.post<IApiResponse<IPost>>(`/admin/posts/${id}/unpublish`, {})).data;
  }
}
