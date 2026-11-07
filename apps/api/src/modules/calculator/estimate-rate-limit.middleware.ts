import type { RequestHandler } from "express";

import rateLimit from "express-rate-limit";

import { HttpException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

export class EstimateRateLimit {
  // The public estimate prices a whole job per call and anyone can send it.
  // The site asks again only after typing pauses, so a real visitor stays
  // well under this; a script hammering it doesn't. Counted per IP in
  // memory, which needs the app's trust proxy set right behind a proxy.
  static middleware(): RequestHandler {
    return rateLimit({
      windowMs: 60 * 1000,
      limit: 30,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(new HttpException(429, tk("calculator.tooManyEstimates"))),
    });
  }
}
