import type { Constructor } from "../metadata/metadata-types";

import { injectable } from "tsyringe";

import { METADATA_KEYS } from "../metadata/metadata-keys";

export function Controller(prefix: string, tags?: string[]): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.CONTROLLER_PREFIX, prefix, target);
    Reflect.defineMetadata(METADATA_KEYS.CONTROLLER_TAGS, tags ?? [], target);
    injectable()(target as Constructor);
  };
}
