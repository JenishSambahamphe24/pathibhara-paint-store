import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

import { ValidationException } from "../errors/validation.exception";

export interface ValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
  headers?: ZodType;
}

export class ValidationMiddleware {
  static create(schema: ValidationSchema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: Record<string, string> = {};

      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors[issue.path.join(".")] = issue.message;
          }
        } else {
          req.params = result.data as typeof req.params;
        }
      }

      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors[issue.path.join(".")] = issue.message;
          }
        } else {
          req.query = result.data as typeof req.query;
        }
      }

      if (schema.headers) {
        const result = schema.headers.safeParse(req.headers);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors[issue.path.join(".")] = issue.message;
          }
        }
      }

      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors[issue.path.join(".")] = issue.message;
          }
        } else {
          req.body = result.data;
        }
      }

      if (Object.keys(errors).length > 0) {
        next(new ValidationException(errors));
        return;
      }

      next();
    };
  }
}
