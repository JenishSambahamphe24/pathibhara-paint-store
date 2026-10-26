import type { Pagination } from "./pagination.types";

import { ApiResponse } from "./api-response";

export class PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  public readonly pagination: Pagination;

  constructor(data: T[], pagination: Pagination, message = "response.success") {
    super(data, message, 200);
    this.pagination = pagination;
  }
}
