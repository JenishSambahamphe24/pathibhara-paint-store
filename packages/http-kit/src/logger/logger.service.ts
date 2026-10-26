import type { LoggerOptions } from "pino";

import pino from "pino";
import { singleton } from "tsyringe";

const REDACT_PATHS = [
  "password",
  "passwd",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "creditCard",
  "credit_card",
  "ssn",
  "cvv",
  // nested in common log fields
  "*.password",
  "*.secret",
  "*.token",
  "*.apiKey",
  "*.api_key",
  "*.authorization",
  "*.cookie",
  "*.accessToken",
  "*.access_token",
  "*.refreshToken",
  "*.refresh_token",
  "*.creditCard",
  "*.credit_card",
  "*.ssn",
  "*.cvv",
  // request/body/query
  "body.password",
  "body.secret",
  "body.token",
  "query.token",
  "query.apiKey",
  "query.api_key",
  // error objects
  "err.params[*]",
];

@singleton()
export class LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({ level: "info" });
  }

  init(options: LoggerOptions = {}): void {
    this.logger = pino({
      level: "info",
      redact: {
        paths: REDACT_PATHS,
        censor: "[REDACTED]",
      },
      // Serialize Error objects logged under `err` with message + stack + type;
      // without this pino emits an empty `{}` for errors and the cause is lost.
      serializers: { err: pino.stdSerializers.err },
      ...options,
    });
  }

  info(...args: unknown[]): void {
    const { meta, message } = LoggerService.parse(args);
    this.logger.info(meta, message);
  }

  error(...args: unknown[]): void {
    const { meta, message } = LoggerService.parse(args);
    this.logger.error(meta, message);
  }

  warn(...args: unknown[]): void {
    const { meta, message } = LoggerService.parse(args);
    this.logger.warn(meta, message);
  }

  debug(...args: unknown[]): void {
    const { meta, message } = LoggerService.parse(args);
    this.logger.debug(meta, message);
  }

  fatal(...args: unknown[]): void {
    const { meta, message } = LoggerService.parse(args);
    this.logger.fatal(meta, message);
  }

  child(bindings: Record<string, unknown>): LoggerService {
    const child = new LoggerService();
    child.logger = this.logger.child(bindings);
    return child;
  }

  get pino(): pino.Logger {
    return this.logger;
  }

  private static parse(args: unknown[]): { meta: Record<string, unknown>; message: string } {
    const meta: Record<string, unknown> = {};
    const messages: string[] = [];

    for (const arg of args) {
      if (arg instanceof Error) {
        meta.err = arg;
      } else if (typeof arg === "object" && arg !== null) {
        Object.assign(meta, arg);
      } else {
        messages.push(String(arg));
      }
    }

    return { meta, message: messages.join(" ") };
  }
}
