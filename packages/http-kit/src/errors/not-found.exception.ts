import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {
  constructor(message = "error.notFound") {
    super(404, message);
  }
}
