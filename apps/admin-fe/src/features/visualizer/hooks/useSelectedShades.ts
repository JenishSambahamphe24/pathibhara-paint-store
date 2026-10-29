import type { TVisualizerSearch } from "../visualizer.schemas";
import type { VisualizerComponent } from "@repo/shared";
import type { IShadeSummary } from "#/features/shades/types";

import { useQueries } from "@tanstack/react-query";
import { useState } from "react";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { ShadeApi } from "#/features/shades/api";
import { SHADE_DETAIL_QUERY_KEY } from "#/features/shades/hooks/useShades";

// The URL holds only shade ids. Shades already seen (picked, or part of a
// preset) are used straight away; the rest, e.g. from a shared link, load.
export function useSelectedShades(search: TVisualizerSearch) {
  const [known, setKnown] = useState<Record<string, IShadeSummary>>({});

  const missing = VISUALIZER_COMPONENTS.map((c) => search[c]).filter(
    (id): id is string => !!id && !(id in known),
  );
  const loaded = useQueries({
    queries: [...new Set(missing)].map((id) => ({
      queryKey: [SHADE_DETAIL_QUERY_KEY, id],
      queryFn: () => ShadeApi.get(id),
    })),
  });

  const byId: Record<string, IShadeSummary> = { ...known };
  for (const query of loaded) {
    if (query.data) byId[query.data.id] = query.data;
  }

  const selected: Partial<Record<VisualizerComponent, IShadeSummary>> = {};
  for (const component of VISUALIZER_COMPONENTS) {
    const id = search[component];
    const shade = id ? (byId[id] as IShadeSummary | undefined) : undefined;
    if (shade) selected[component] = shade;
  }

  function remember(shades: Array<IShadeSummary>) {
    setKnown((prev) => ({
      ...prev,
      ...Object.fromEntries(shades.map((shade) => [shade.id, shade])),
    }));
  }

  return { selected, remember };
}
