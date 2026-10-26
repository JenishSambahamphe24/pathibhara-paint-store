import type {
  Constructor,
  ParamMetadata,
  ResponseMetadata,
  RouteMetadata,
  ValidationMetadata,
} from "../metadata/metadata-types";
import type { NextFunction, Request, RequestHandler, Response, Router } from "express";
import type { ZodType } from "zod";

import { container } from "tsyringe";

import { I18nService } from "../i18n/i18n.service";
import { METADATA_KEYS } from "../metadata/metadata-keys";
import { OpenApiRegistryService } from "../openapi/openapi-registry.service";
import { ApiResponse } from "../response/api-response";
import { PaginatedResponse } from "../response/paginated-response";
import { ValidationMiddleware } from "../validation/validation.middleware";

export class ControllerLoader {
  static load(router: Router, controllerClasses: Constructor[]): void {
    const registryService = container.resolve(OpenApiRegistryService);
    const i18n = container.resolve(I18nService);

    for (const controllerClass of controllerClasses) {
      const prefix: string =
        Reflect.getMetadata(METADATA_KEYS.CONTROLLER_PREFIX, controllerClass) ?? "";
      const tags: string[] =
        Reflect.getMetadata(METADATA_KEYS.CONTROLLER_TAGS, controllerClass) ?? [];
      const routes: RouteMetadata[] =
        Reflect.getMetadata(METADATA_KEYS.ROUTES, controllerClass) ?? [];

      const controllerInstance = container.resolve(controllerClass);

      const classMiddleware: RequestHandler[] =
        Reflect.getOwnMetadata(METADATA_KEYS.CONTROLLER_MIDDLEWARE, controllerClass) ?? [];

      for (const route of routes) {
        const fullPath = ControllerLoader.normalizePath(`${prefix}/${route.path}`);
        const handlerName = route.handlerName;

        const validationMeta: ValidationMetadata | undefined = Reflect.getMetadata(
          METADATA_KEYS.VALIDATE_SCHEMA,
          controllerClass.prototype,
          handlerName,
        );

        const paramKey = `${METADATA_KEYS.ROUTE_PARAMS.toString()}:${String(handlerName)}`;
        const paramsMeta: ParamMetadata[] =
          Reflect.getOwnMetadata(paramKey, controllerClass.prototype) ?? [];

        const routeMiddlewareKey = `${METADATA_KEYS.ROUTE_MIDDLEWARE.toString()}:${String(handlerName)}`;
        const routeMiddleware: RequestHandler[] =
          Reflect.getOwnMetadata(routeMiddlewareKey, controllerClass) ?? [];

        const middlewares: RequestHandler[] = [...classMiddleware, ...routeMiddleware];
        if (validationMeta) {
          middlewares.push(ValidationMiddleware.create(validationMeta));
        }

        const handler = async (req: Request, res: Response, next: NextFunction) => {
          try {
            const args = ControllerLoader.resolveParams(paramsMeta, req, res);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (controllerInstance as any)[handlerName](...args);

            if (result !== undefined && !res.headersSent) {
              if (result instanceof PaginatedResponse) {
                res.json({
                  message: i18n.t(result.message),
                  data: result.data,
                  pagination: result.pagination,
                });
              } else if (result instanceof ApiResponse) {
                if (result.statusCode === 204) {
                  res.status(204).send();
                } else {
                  res
                    .status(result.statusCode)
                    .json({ message: i18n.t(result.message), data: result.data });
                }
              } else {
                res.json({ message: i18n.t("response.success"), data: result });
              }
            }
          } catch (err) {
            next(err);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router as any)[route.method](fullPath, ...middlewares, handler);

        const responseMeta: ResponseMetadata[] =
          Reflect.getOwnMetadata(METADATA_KEYS.RESPONSES, controllerClass.prototype, handlerName) ??
          [];

        const responses: Record<
          number,
          { description: string; schema?: ZodType; paginated?: boolean }
        > = {};
        for (const entry of responseMeta) {
          responses[entry.statusCode] = {
            description: entry.description,
            schema: entry.schema,
            paginated: entry.paginated,
          };
        }

        registryService.registerRoute({
          method: route.method,
          path: fullPath,
          summary: route.summary,
          description: route.description,
          tags,
          validation: validationMeta,
          responses,
        });
      }
    }
  }

  private static resolveParams(
    paramsMeta: ParamMetadata[],
    req: Request,
    res: Response,
  ): unknown[] {
    if (paramsMeta.length === 0) {
      return [req, res];
    }

    const args: unknown[] = [];

    for (const param of paramsMeta) {
      switch (param.type) {
        case "body":
          args[param.index] = req.body;
          break;
        case "query":
          args[param.index] = req.query;
          break;
        case "params":
          args[param.index] = req.params;
          break;
        case "headers":
          args[param.index] = req.headers;
          break;
        case "req":
          args[param.index] = req;
          break;
        case "res":
          args[param.index] = res;
          break;
      }
    }

    return args;
  }

  private static normalizePath(path: string): string {
    return "/" + path.split("/").filter(Boolean).join("/");
  }
}
