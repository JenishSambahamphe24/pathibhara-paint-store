import type { ZodType } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface DtoClass {
  schema: ZodType;
}

export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  handlerName: string | symbol;
  summary?: string;
  description?: string;
}

export interface ResponseMetadata {
  statusCode: number;
  description: string;
  schema?: ZodType;
  paginated?: boolean;
}

export interface ParamMetadata {
  index: number;
  type: "body" | "query" | "params" | "headers" | "req" | "res";
}

export interface ValidationMetadata {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
  headers?: ZodType;
}
