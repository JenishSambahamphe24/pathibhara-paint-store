import type { Request, RequestHandler } from "express";

import pinoHttp from "pino-http";
import { container } from "tsyringe";

import { LoggerService } from "./logger.service";
import { Redact } from "./redact";

export interface RequestLoggerOptions {
  production?: boolean;
}

export class RequestLogger {
  static middleware(options: RequestLoggerOptions = {}): RequestHandler {
    const loggerService = container.resolve(LoggerService);
    const isProduction = options.production ?? false;

    return pinoHttp({
      logger: loggerService.pino,
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? "";
          return url === "/health-check" || url.startsWith("/docs") || url === "/openapi.json";
        },
      },
      quietReqLogger: true,
      customAttributeKeys: { reqId: "requestId" },
      serializers: {
        req: () => undefined,
        res: () => undefined,
      },
      customSuccessMessage: (_req, res, responseTime) =>
        `${_req.method} ${_req.url} ${String(res.statusCode)} ${String(responseTime)}ms`,
      customErrorMessage: (_req, res, responseTime) =>
        `${_req.method} ${_req.url} ${String(res.statusCode)} ${String(responseTime)}ms`,
      customSuccessObject: (req, _res, _val) =>
        RequestLogger.buildPayload(req as Request, isProduction),
      customErrorObject: (req, _res, _err, _val) =>
        RequestLogger.buildPayload(req as Request, isProduction),
    }) as RequestHandler;
  }

  private static buildPayload(req: Request, isProduction: boolean): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (!isProduction && req.params && Object.keys(req.params).length > 0) {
      payload.params = req.params;
    }

    if (req.query && Object.keys(req.query).length > 0) {
      payload.query = Redact.value(req.query);
    }

    if (req.body && Object.keys(req.body as object).length > 0) {
      payload.body = Redact.value(req.body);
    }

    return payload;
  }
}
