import type { IColourSet } from "../types";
import type { ColourSetInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { colourSetInputSchema } from "@repo/shared";

import {
  SHADE_DETAIL_QUERY_KEY,
  SHADE_LIST_QUERY_KEY,
} from "#/features/shades/hooks/useShades";
import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { ColourSetApi } from "../api";
import {
  COLOUR_SET_DETAIL_QUERY_KEY,
  COLOUR_SET_LIST_QUERY_KEY,
} from "./useColourSets";

interface UseColourSetFormOptions {
  colourSet: IColourSet | null;
  onSaved: () => void;
}

export function useColourSetForm({
  colourSet,
  onSaved,
}: UseColourSetFormOptions) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (value: ColourSetInput) =>
      colourSet
        ? ColourSetApi.update(colourSet.id, value)
        : ColourSetApi.create(value),
    onSuccess: async () => {
      toaster.success({
        description: colourSet
          ? m.colour_sets_saved()
          : m.colour_sets_created(),
      });
      // Shades show how many sets use them.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [COLOUR_SET_LIST_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [COLOUR_SET_DETAIL_QUERY_KEY],
        }),
        queryClient.invalidateQueries({ queryKey: [SHADE_LIST_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [SHADE_DETAIL_QUERY_KEY] }),
      ]);
      onSaved();
    },
  });

  const defaultValues: ColourSetInput = colourSet
    ? {
        slug: colourSet.slug,
        isActive: colourSet.isActive,
        translations: {
          en: {
            name: colourSet.translations.en.name,
            description: colourSet.translations.en.description ?? "",
          },
          ne: {
            name: colourSet.translations.ne?.name ?? "",
            description: colourSet.translations.ne?.description ?? "",
          },
        },
        shades: {
          main_surface: colourSet.shades.main_surface.id,
          columns: colourSet.shades.columns.id,
          doors_windows: colourSet.shades.doors_windows.id,
          roof_edge: colourSet.shades.roof_edge.id,
        },
      }
    : {
        slug: "",
        isActive: true,
        translations: {
          en: { name: "", description: "" },
          ne: { name: "", description: "" },
        },
        shades: {
          main_surface: "",
          columns: "",
          doors_windows: "",
          roof_edge: "",
        },
      };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: colourSetInputSchema,
      onChange: FormHelper.gatedSchema(colourSetInputSchema, hasSubmittedRef),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        FormHelper.handleSubmitError(error, formApi);
      }
    },
  });

  function handleSubmit() {
    hasSubmittedRef.current = true;
    form.handleSubmit();
  }

  return { form, handleSubmit };
}
