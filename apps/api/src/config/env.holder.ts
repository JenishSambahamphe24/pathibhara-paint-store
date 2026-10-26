import type { envSchema } from "./env.schema";
import type { z } from "zod";

export type Env = z.infer<typeof envSchema>;

let parsed: Env | null = null;

export class EnvHolder {
  static init(env: Env): void {
    parsed = env;
  }

  static get(): Env {
    if (parsed === null) {
      throw new Error("Env not initialized. Call EnvHolder.init(env) at app bootstrap.");
    }
    return parsed;
  }
}
