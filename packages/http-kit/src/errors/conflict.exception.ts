import { HttpException } from "./http.exception";

export class ConflictException extends HttpException {
  /**
   * `errors` carries field-scoped messages (`{ email: "…" }`) when the conflict
   * maps cleanly to a form field, so the client can show it inline. Omit it for
   * conflicts that aren't field-specific — the `message` is then shown on its
   * own.
   */
  constructor(
    message = "error.conflict",
    errors?: Record<string, string>,
    params?: Record<string, unknown>,
  ) {
    super(409, message, errors, params);
  }
}
