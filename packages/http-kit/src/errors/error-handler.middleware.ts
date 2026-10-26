import type { NextFunction, Request, Response } from "express";

import { container } from "tsyringe";

import { I18nService } from "../i18n/i18n.service";
import { LoggerService } from "../logger/logger.service";
import { HttpException } from "./http.exception";

/** Postgres `unique_violation` SQLSTATE — a duplicate key, i.e. a conflict. */
const PG_UNIQUE_VIOLATION = "23505";

export class ErrorHandler {
  /**
   * Walks an error's `cause` chain looking for a Postgres SQLSTATE code. ORM
   * layers (e.g. Drizzle) wrap the driver error, so the `code` lives a few
   * `cause` hops down rather than on the thrown error itself.
   */
  private static pgErrorCode(err: unknown): string | undefined {
    const seen = new Set<unknown>();
    let current: unknown = err;
    while (current && typeof current === "object" && !seen.has(current)) {
      seen.add(current);
      const code = (current as { code?: unknown }).code;
      if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
      current = (current as { cause?: unknown }).cause;
    }
    return undefined;
  }

  static middleware() {
    const i18n = container.resolve(I18nService);
    const logger = container.resolve(LoggerService);

    return (err: Error, req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof HttpException) {
        const body: Record<string, unknown> = { message: i18n.t(err.message, err.params) };
        if (err.errors) {
          // Translate each field message too, so services can pass i18n keys
          // (e.g. `{ email: "auth.emailInUse" }`). Validation messages are
          // already literal strings — `t()` returns those unchanged.
          body.errors = Object.fromEntries(
            Object.entries(err.errors).map(([field, message]) => [
              field,
              i18n.t(message),
            ]),
          );
        }

        // Always surface handled errors server-side — silently returning a 5xx
        // makes production failures invisible. 5xx are our/upstream fault (log
        // with stack as an error); 4xx are client/validation issues (log as a
        // warning so they're visible without reading as incidents).
        const context = {
          statusCode: err.statusCode,
          method: req.method,
          path: req.originalUrl,
        };
        if (err.statusCode >= 500) {
          logger.error({ ...context, err }, `Request failed: ${err.message}`);
        } else {
          logger.warn(context, `Request rejected: ${err.message}`);
        }

        res.status(err.statusCode).json(body);
        return;
      }

      // Safety net: a duplicate-key violation that wasn't pre-checked at the
      // service layer would otherwise surface as a raw 500. Map it to a clean
      // 409 so the client always gets a friendly message — never leaked SQL.
      // It's still logged (warn) so a missing pre-check stays visible.
      if (ErrorHandler.pgErrorCode(err) === PG_UNIQUE_VIOLATION) {
        logger.warn(
          { statusCode: 409, method: req.method, path: req.originalUrl },
          "Request rejected: unique constraint violation",
        );
        res.status(409).json({ message: i18n.t("error.conflict") });
        return;
      }

      logger.error(err, "Unhandled error");
      res.status(500).json({ message: i18n.t("error.internalServer") });
    };
  }
}
