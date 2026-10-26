import type { OpenAPIObject } from "openapi3-ts/oas31";

import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { injectable } from "tsyringe";

import { OpenApiRegistryService } from "./openapi-registry.service";

export interface SpecConfig {
  title: string;
  version: string;
  description?: string;
}

@injectable()
export class OpenApiGeneratorService {
  constructor(private readonly registryService: OpenApiRegistryService) {}

  generate(config: SpecConfig): OpenAPIObject {
    const generator = new OpenApiGeneratorV31(this.registryService.registry.definitions);
    return generator.generateDocument({
      openapi: "3.1.0",
      info: {
        title: config.title,
        version: config.version,
        ...(config.description && { description: config.description }),
      },
    });
  }
}
