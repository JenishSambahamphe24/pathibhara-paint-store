import type translation from "./en/translation.json";

type FlattenKeys<T, Prefix extends string = ""> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? FlattenKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`;
      }[keyof T & string]
    : never;

export type TranslationKey = FlattenKeys<typeof translation>;

export function tk(key: TranslationKey): string {
  return key;
}
