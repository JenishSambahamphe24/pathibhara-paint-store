import type { Pagination } from "./pagination.types";

export interface BuildPaginationParams {
  page: number;
  perPage: number;
  total: number;
}

export class PaginationHelper {
  static build({ page, perPage, total }: BuildPaginationParams): Pagination {
    return { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  }

  static offset(page: number, perPage: number): number {
    return (page - 1) * perPage;
  }
}
