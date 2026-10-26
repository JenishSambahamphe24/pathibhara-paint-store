import { HttpException } from "./http.exception";

export class ValidationException extends HttpException {
  constructor(errors: Record<string, string>, message = "error.validationFailed") {
    super(422, message, errors);
  }
}
