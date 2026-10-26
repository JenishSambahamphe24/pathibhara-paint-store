import type {
  ICursorPagination,
  ICursorPaginationParams,
  IPagePagination,
  IPagePaginationParams,
  TPagination,
} from "#/types/api.types";

export class PaginationHelper {
  static isPageBased(pagination: TPagination): pagination is IPagePagination {
    return "currentPage" in pagination;
  }

  static isCursorBased(
    pagination: TPagination,
  ): pagination is ICursorPagination {
    return "nextCursor" in pagination;
  }

  static getTotalPages(pagination: IPagePagination): number {
    return Math.ceil(pagination.total / pagination.perPage);
  }

  static hasNextPage(pagination: TPagination): boolean {
    if (PaginationHelper.isPageBased(pagination)) {
      return (
        pagination.currentPage < PaginationHelper.getTotalPages(pagination)
      );
    }

    return pagination.nextCursor !== null;
  }

  static hasPreviousPage(pagination: TPagination): boolean {
    if (PaginationHelper.isPageBased(pagination)) {
      return pagination.currentPage > 1;
    }

    return pagination.previousCursor !== null;
  }

  static toParams(pagination: IPagePagination): IPagePaginationParams;
  static toParams(pagination: ICursorPagination): ICursorPaginationParams;
  static toParams(
    pagination: TPagination,
  ): IPagePaginationParams | ICursorPaginationParams;
  static toParams(
    pagination: TPagination,
  ): IPagePaginationParams | ICursorPaginationParams {
    if (PaginationHelper.isPageBased(pagination)) {
      return { page: pagination.currentPage, perPage: pagination.perPage };
    }

    return {
      cursor: pagination.nextCursor ?? undefined,
      perPage: pagination.perPage,
      direction: pagination.direction,
    };
  }

  /**
   * Pass the **response** pagination (i.e. `data.pagination`), not the
   * previous local state. For page-based that's just an increment; for
   * cursor-based the helper promotes the response's `nextCursor` into
   * `state.nextCursor`, which is what `toParams` reads on the next fetch.
   * Calling with stale state (e.g. the initial `{nextCursor: null}`)
   * would silently re-fetch page 1 — that's the pagination bug fixed here.
   */
  static nextPage<T extends TPagination>(current: T): T {
    if (PaginationHelper.isPageBased(current)) {
      return { ...current, currentPage: current.currentPage + 1 };
    }
    return {
      ...current,
      // `current.nextCursor` is the boundary cursor for the next page —
      // keep it; `toParams` will send it as `?cursor=`.
      previousCursor: null,
      direction: "forward",
    };
  }

  /**
   * Inverse of `nextPage`. Same rule: pass `data.pagination`, not state.
   * Cursor-based: promote the response's `previousCursor` into the
   * outgoing `nextCursor` slot so the next fetch asks the BE for the
   * page before the current one.
   */
  static previousPage<T extends TPagination>(current: T): T {
    if (PaginationHelper.isPageBased(current)) {
      return { ...current, currentPage: current.currentPage - 1 };
    }
    return {
      ...current,
      nextCursor: current.previousCursor,
      previousCursor: null,
      direction: "backward",
    };
  }

  static changePerPage<T extends TPagination>(
    pagination: T,
    perPage: number,
  ): T {
    if (PaginationHelper.isPageBased(pagination)) {
      return { ...pagination, perPage, currentPage: 1 };
    }
    return {
      ...pagination,
      perPage,
      nextCursor: null,
      previousCursor: null,
    };
  }
}
