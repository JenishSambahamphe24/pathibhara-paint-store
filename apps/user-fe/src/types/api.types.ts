export interface IApiResponse<TData> {
  message: string;
  data: TData;
}

export interface IApiError {
  message: string;
  errors?: Record<string, string>;
}

export interface IPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedApiResponse<TData> extends IApiResponse<
  Array<TData>
> {
  pagination: IPagination;
}

export interface IPage<TData> {
  items: Array<TData>;
  pagination: IPagination;
}

export interface IPublicImage {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  blurHash: string | null;
}

export interface ISlugRef {
  slug: string;
  name: string;
}
