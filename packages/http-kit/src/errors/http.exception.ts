export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, string>,
    /**
     * Interpolation values for the `message` key, so a rejection can name the
     * actual numbers ("exceeds your 500.00 limit, 450.00 already used") instead
     * of a generic sentence the user has to guess at. Filled in by i18next at
     * response time, so the key holds `{{placeholders}}`.
     */
    public readonly params?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
