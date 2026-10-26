import type { ZodType } from "zod";

export abstract class BaseDto {
  static readonly schema: ZodType;

  static parse<TSchema extends ZodType>(
    this: { schema: TSchema },
    data: unknown,
  ): TSchema["_output"] {
    return this.schema.parse(data);
  }

  static safeParse<TSchema extends ZodType>(
    this: { schema: TSchema },
    data: unknown,
  ): ReturnType<TSchema["safeParse"]> {
    return this.schema.safeParse(data) as ReturnType<TSchema["safeParse"]>;
  }
}

export type DtoType<T extends { schema: ZodType }> = T["schema"]["_output"];
