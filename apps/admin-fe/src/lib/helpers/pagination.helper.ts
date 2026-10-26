import type { IPagination } from "#/types/api.types";

export class PaginationHelper {
  static empty(perPage: number): IPagination {
    return { page: 1, perPage, total: 0, totalPages: 1 };
  }

  static hasNextPage(pagination: IPagination): boolean {
    return pagination.page < pagination.totalPages;
  }

  static hasPreviousPage(pagination: IPagination): boolean {
    return pagination.page > 1;
  }
}
