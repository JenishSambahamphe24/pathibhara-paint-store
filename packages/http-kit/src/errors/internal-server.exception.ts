import { HttpException } from "./http.exception";

export class InternalServerException extends HttpException {
  constructor(message = "error.internalServer") {
    super(500, message);
  }
}
