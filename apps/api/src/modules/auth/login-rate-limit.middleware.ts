import type { RequestHandler } from "express";

import rateLimit from "express-rate-limit";

import { HttpException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

export class LoginRateLimit {
  static middleware(): RequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      handler: (_req, _res, next) => next(new HttpException(429, tk("error.tooManyRequests"))),
    });
  }
}
