import type { DtoClass, ValidationMetadata } from "../metadata/metadata-types";

import { METADATA_KEYS } from "../metadata/metadata-keys";

export interface ValidateOptions {
  body?: DtoClass;
  query?: DtoClass;
  params?: DtoClass;
  headers?: DtoClass;
}

export function Validate(options: ValidateOptions): MethodDecorator {
  return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
    const metadata: ValidationMetadata = {
      body: options.body?.schema,
      query: options.query?.schema,
      params: options.params?.schema,
      headers: options.headers?.schema,
    };
    Reflect.defineMetadata(METADATA_KEYS.VALIDATE_SCHEMA, metadata, target, propertyKey);
  };
}
