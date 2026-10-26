import type { ParamMetadata } from "../metadata/metadata-types";

import { METADATA_KEYS } from "../metadata/metadata-keys";

type ParamType = ParamMetadata["type"];

function createParamDecorator(type: ParamType): () => ParameterDecorator {
  return () => {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      const metadataKey = `${METADATA_KEYS.ROUTE_PARAMS.toString()}:${String(propertyKey)}`;
      const existingParams: ParamMetadata[] = Reflect.getOwnMetadata(metadataKey, target) ?? [];

      existingParams.push({ index: parameterIndex, type });

      Reflect.defineMetadata(metadataKey, existingParams, target);
    };
  };
}

export const Body = createParamDecorator("body");
export const Query = createParamDecorator("query");
export const Params = createParamDecorator("params");
export const Headers = createParamDecorator("headers");
export const Req = createParamDecorator("req");
export const Res = createParamDecorator("res");
