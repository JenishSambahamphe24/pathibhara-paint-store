export const METADATA_KEYS = {
  CONTROLLER_PREFIX: Symbol("controller:prefix"),
  CONTROLLER_TAGS: Symbol("controller:tags"),
  CONTROLLER_MIDDLEWARE: Symbol("controller:middleware"),
  ROUTES: Symbol("controller:routes"),
  ROUTE_PARAMS: Symbol("route:params"),
  ROUTE_MIDDLEWARE: Symbol("route:middleware"),
  VALIDATE_SCHEMA: Symbol("route:validate"),
  RESPONSES: Symbol("route:responses"),
} as const;
