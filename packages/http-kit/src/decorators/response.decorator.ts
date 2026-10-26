import type { DtoClass, ResponseMetadata } from "../metadata/metadata-types";

import { METADATA_KEYS } from "../metadata/metadata-keys";

function addResponseMetadata(
  target: object,
  propertyKey: string | symbol,
  entry: ResponseMetadata,
): void {
  const existing: ResponseMetadata[] =
    Reflect.getOwnMetadata(METADATA_KEYS.RESPONSES, target, propertyKey) ?? [];
  existing.push(entry);
  Reflect.defineMetadata(METADATA_KEYS.RESPONSES, existing, target, propertyKey);
}

export function OkResponse(dto: DtoClass, description = "OK"): MethodDecorator {
  return (target, propertyKey) => {
    addResponseMetadata(target, propertyKey, {
      statusCode: 200,
      description,
      schema: dto.schema,
    });
  };
}

export function PaginatedOkResponse(dto: DtoClass, description = "OK"): MethodDecorator {
  return (target, propertyKey) => {
    addResponseMetadata(target, propertyKey, {
      statusCode: 200,
      description,
      schema: dto.schema,
      paginated: true,
    });
  };
}

export function CreatedResponse(dto: DtoClass, description = "Created"): MethodDecorator {
  return (target, propertyKey) => {
    addResponseMetadata(target, propertyKey, {
      statusCode: 201,
      description,
      schema: dto.schema,
    });
  };
}

export function NoContentResponse(description = "No Content"): MethodDecorator {
  return (target, propertyKey) => {
    addResponseMetadata(target, propertyKey, {
      statusCode: 204,
      description,
    });
  };
}

export function NotFoundResponse(description = "Not Found"): MethodDecorator {
  return (target, propertyKey) => {
    addResponseMetadata(target, propertyKey, {
      statusCode: 404,
      description,
    });
  };
}
