import { HttpException } from "./http.exception";

export class ForbiddenException extends HttpException {
  constructor(message = "error.forbidden", errors?: Record<string, string>) {
    super(403, message, errors);
  }
}
