export interface IApiResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface IPagePagination {
  total: number;
  perPage: number;
  currentPage: number;
}

export type TPaginationDirection = "forward" | "backward";

export interface ICursorPagination {
  perPage: number;
  nextCursor: string | null;
  previousCursor: string | null;
  /**
   * Which way the user navigated to reach this page. Forward is the
   * default and means "older rows past the cursor"; backward asks for
   * "newer rows past the cursor" (used by the Previous button).
   */
  direction?: TPaginationDirection;
}

export type TPagination = IPagePagination | ICursorPagination;

export interface IPaginatedApiResponse<TData> extends IApiResponse<
  Array<TData>
> {
  pagination: TPagination;
}

export interface IPagePaginationParams {
  page: number;
  perPage: number;
}

export interface ICursorPaginationParams {
  cursor?: string;
  perPage: number;
  direction?: TPaginationDirection;
}
