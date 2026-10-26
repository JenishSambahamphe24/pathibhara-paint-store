import type { RequestHandler } from "express";

import { METADATA_KEYS } from "../metadata/metadata-keys";

/**
 * Attach Express middleware to a controller class or controller method.
 * Class-level middleware runs before method-level middleware on each route.
 */
export function UseMiddleware(...middleware: RequestHandler[]): MethodDecorator & ClassDecorator {
  return function (target: object, propertyKey?: string | symbol): void {
    if (propertyKey !== undefined) {
      const ctor = (target as { constructor: object }).constructor;
      const key = `${METADATA_KEYS.ROUTE_MIDDLEWARE.toString()}:${String(propertyKey)}`;
      const existing = (Reflect.getOwnMetadata(key, ctor) as RequestHandler[] | undefined) ?? [];
      Reflect.defineMetadata(key, [...existing, ...middleware], ctor);
      return;
    }

    const existing =
      (Reflect.getOwnMetadata(METADATA_KEYS.CONTROLLER_MIDDLEWARE, target) as
        | RequestHandler[]
        | undefined) ?? [];
    Reflect.defineMetadata(
      METADATA_KEYS.CONTROLLER_MIDDLEWARE,
      [...existing, ...middleware],
      target,
    );
  };
}
