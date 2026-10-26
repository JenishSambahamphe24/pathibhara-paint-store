import { HttpException } from "./http.exception";

export class ServiceUnavailableException extends HttpException {
  constructor(message = "error.serviceUnavailable", errors?: Record<string, string>) {
    super(503, message, errors);
  }
}
