import type { HttpMethod, RouteMetadata } from "../metadata/metadata-types";

import { METADATA_KEYS } from "../metadata/metadata-keys";

interface MethodOptions {
  summary?: string;
  description?: string;
}

function createMethodDecorator(method: HttpMethod) {
  return function (path: string, options?: MethodOptions): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const routes: RouteMetadata[] =
        Reflect.getOwnMetadata(METADATA_KEYS.ROUTES, target.constructor) ?? [];

      routes.push({
        method,
        path,
        handlerName: propertyKey,
        summary: options?.summary,
        description: options?.description,
      });

      Reflect.defineMetadata(METADATA_KEYS.ROUTES, routes, target.constructor);
    };
  };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Patch = createMethodDecorator("patch");
export const Delete = createMethodDecorator("delete");
