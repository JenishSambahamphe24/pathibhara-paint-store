import { HttpException } from "./http.exception";

export class BadRequestException extends HttpException {
  constructor(
    message = "error.badRequest",
    errors?: Record<string, string>,
    params?: Record<string, unknown>,
  ) {
    super(400, message, errors, params);
  }
}
