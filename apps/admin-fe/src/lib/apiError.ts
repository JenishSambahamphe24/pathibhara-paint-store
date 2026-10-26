import type { IApiError } from "#/types/api.types";

export class ApiError extends Error {
  constructor(public readonly body: IApiError) {
    super(body.message);
    this.name = "ApiError";
  }
}
