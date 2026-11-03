import type { IApiError } from "#/types/api.types";

export class ApiError extends Error {
  constructor(
    public readonly body: IApiError,
    public readonly status = 0,
  ) {
    super(body.message);
    this.name = "ApiError";
  }

  static isNotFound(error: unknown): boolean {
    return error instanceof ApiError && error.status === 404;
  }
}
