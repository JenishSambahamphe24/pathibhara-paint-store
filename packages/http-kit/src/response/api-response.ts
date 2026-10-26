export class ApiResponse<T = unknown> {
  constructor(
    public readonly data: T,
    public readonly message: string,
    public readonly statusCode: number,
  ) {}

  static ok<T>(data: T, message = "response.success"): ApiResponse<T> {
    return new ApiResponse(data, message, 200);
  }

  static created<T>(data: T, message = "response.created"): ApiResponse<T> {
    return new ApiResponse(data, message, 201);
  }

  static noContent(message = "response.deleted"): ApiResponse<null> {
    return new ApiResponse(null, message, 204);
  }
}
