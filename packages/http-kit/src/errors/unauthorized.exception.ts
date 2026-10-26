import { HttpException } from "./http.exception";

export class UnauthorizedException extends HttpException {
  constructor(message = "error.unauthorized", errors?: Record<string, string>) {
    super(401, message, errors);
  }
}
