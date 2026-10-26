import type { AnyFormApi, StandardSchemaV1 } from "@tanstack/react-form";
import type { RefObject } from "react";
import type { z } from "zod";

import { ApiError } from "#/lib/apiError";
import { toaster } from "#/lib/toaster";

import { ApiErrorHelper } from "./apiError.helper";

export class FormHelper {
  // Form state may hold null for a number nobody has typed yet; the shared API
  // schema rejecting that null is exactly how "Enter a quantity" gets shown.
  // So the schema validates the form's values even though its input type is
  // stricter than the form's.
  static validator<TValues>(schema: z.ZodType): StandardSchemaV1<TValues> {
    return schema as unknown as StandardSchemaV1<TValues>;
  }

  static gatedSchema<T extends StandardSchemaV1>(
    schema: T,
    gateRef: RefObject<boolean>,
  ): T {
    return {
      "~standard": {
        version: 1 as const,
        vendor: schema["~standard"].vendor,
        validate(value: unknown) {
          if (!gateRef.current) return { value };
          return schema["~standard"].validate(value);
        },
      },
    } as unknown as T;
  }

  // A server error sticks until the field changes; call on every edit.
  static clearServerError(field: {
    state: { meta: { errorMap: Record<string, unknown> } };
    setMeta: (updater: (meta: any) => any) => void;
  }): void {
    if (!field.state.meta.errorMap.onServer) return;
    field.setMeta((meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onServer: undefined },
    }));
  }

  static getFieldError(errors: Array<unknown>): string | undefined {
    const e = errors[0];
    if (!e) return undefined;
    if (typeof e === "string") return e;
    return (e as { message?: string }).message ?? String(e);
  }

  /**
   * Drops every validation error parked on `fields`.
   *
   * A form-level validator's error sticks to a field until that field's own
   * value changes — TanStack Form files it under `errorMap.onSubmit`, and a
   * later pass that no longer reports the field leaves it alone. So a field
   * that stops being validated at all (its section switched off, say) never
   * changes again, and its last complaint outlives the section: the form stays
   * invalid and submit is refused with nothing on screen, because the section
   * that would render the error isn't there any more.
   */
  static clearFieldErrors(formApi: AnyFormApi, fields: Array<string>): void {
    for (const field of fields) {
      formApi.setFieldMeta(field as never, (meta) => ({
        ...meta,
        errorMap: {},
        errors: [],
      }));
    }
  }

  static handleSubmitError(error: unknown, formApi: AnyFormApi): void {
    const fieldErrors =
      error instanceof ApiError ? Object.entries(error.body.errors ?? {}) : [];

    if (fieldErrors.length > 0) {
      for (const [field, message] of fieldErrors) {
        formApi.setFieldMeta(field as never, (meta) => ({
          ...meta,
          errorMap: {
            ...meta.errorMap,
            onServer: message,
          },
        }));
      }
      // Also toast: a server field key (e.g. the API payload's
      // `discountedPriceCents`) doesn't always match a real form field name
      // (e.g. `discountedPriceDollars`), in which case setFieldMeta above
      // silently targets a field the form doesn't render — the toast is the
      // only channel the admin actually sees in that case.
      toaster.error({ description: fieldErrors[0][1] });
    } else {
      toaster.error({ description: ApiErrorHelper.describe(error) });
    }
  }
}
