import { ApiError } from "#/lib/apiError";
import { m } from "#/paraglide/messages";

/**
 * Mutation `onError` helpers. Use the {@link ApiErrorHelper.describe}
 * method for a toast-ready string that prefers the BE's error body and
 * falls back to a generic message when the failure isn't shaped like an
 * `ApiError` (network failure, unexpected throw, etc.).
 */
export class ApiErrorHelper {
  static describe(error: unknown): string {
    if (error instanceof ApiError) return error.body.message;
    return m.generic_unexpected_error();
  }
}
