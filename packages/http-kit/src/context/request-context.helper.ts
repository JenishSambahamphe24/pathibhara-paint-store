import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AsyncLocalStorage } from "node:async_hooks";

import { RequestMetadataHelper } from "../helpers/request-metadata.helper";

export interface RequestContextStore {
  ipAddress: string | null;
  userAgent: string | null;
}

// Reads outside an HTTP request (scripts, seeds) return null fields, so
// callers don't have to special-case the absence of a request.
export class RequestContextHelper {
  private static readonly storage = new AsyncLocalStorage<RequestContextStore>();

  static middleware(): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
      RequestContextHelper.storage.run(RequestMetadataHelper.extract(req), () => next());
    };
  }

  static get(): RequestContextStore {
    return RequestContextHelper.storage.getStore() ?? { ipAddress: null, userAgent: null };
  }

  static run<T>(store: RequestContextStore, fn: () => T): T {
    return RequestContextHelper.storage.run(store, fn);
  }
}
