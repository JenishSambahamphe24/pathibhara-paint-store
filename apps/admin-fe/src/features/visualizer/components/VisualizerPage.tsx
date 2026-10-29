import type { TVisualizerSearch } from "../visualizer.schemas";
import type { VisualizerComponent } from "@repo/shared";
import type { IColourSetListItem } from "#/features/colourSets/types";

import clsx from "clsx";
import { RotateCcw } from "lucide-react";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { FormSection } from "#/components/FormSection/FormSection";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { ColourSetSwatches } from "#/features/colourSets/components/ColourSetSwatches";
import { VisualizerComponentHelper } from "#/features/colourSets/helpers/visualizerComponent.helper";
import { useColourSets } from "#/features/colourSets/hooks/useColourSets";
import { ShadePicker } from "#/features/shades/components/ShadePicker";
import { m } from "#/paraglide/messages";

import { useSelectedShades } from "../hooks/useSelectedShades";
import { HouseViewer } from "./HouseViewer";

interface VisualizerPageProps {
  search: TVisualizerSearch;
  onSearchChange: (patch: Partial<TVisualizerSearch>) => void;
}

const NO_SHADES: TVisualizerSearch = {
  main_surface: undefined,
  columns: undefined,
  doors_windows: undefined,
  roof_edge: undefined,
};

export function VisualizerPage({
  search,
  onSearchChange,
}: VisualizerPageProps) {
  const { selected, remember } = useSelectedShades(search);
  const { data: sets, isLoading } = useColourSets({
    status: "active",
    page: 1,
    perPage: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const colours: Partial<Record<VisualizerComponent, string>> =
    Object.fromEntries(
      VISUALIZER_COMPONENTS.flatMap((component) => {
        const shade = selected[component];
        return shade ? [[component, shade.hex]] : [];
      }),
    );
  const hasAnyShade = VISUALIZER_COMPONENTS.some((c) => search[c]);

  function applySet(set: IColourSetListItem) {
    remember(Object.values(set.shades));
    onSearchChange(
      Object.fromEntries(
        VISUALIZER_COMPONENTS.map((c) => [c, set.shades[c].id]),
      ) as TVisualizerSearch,
    );
  }

  const isSetApplied = (set: IColourSetListItem) =>
    VISUALIZER_COMPONENTS.every((c) => search[c] === set.shades[c].id);

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_colours() },
          { title: m.sidebar_visualizer() },
        ]}
      />
      <PageHeader
        title={m.visualizer_title()}
        description={m.visualizer_description()}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <FormSection
            title={m.visualizer_pick_shades()}
            description={m.visualizer_pick_shades_hint()}
          >
            {VISUALIZER_COMPONENTS.map((component) => (
              <ShadePicker
                key={component}
                label={VisualizerComponentHelper.label(component)}
                value={search[component] ?? ""}
                selected={selected[component]}
                onChange={(shade) => {
                  if (shade) remember([shade]);
                  onSearchChange({ [component]: shade?.id });
                }}
              />
            ))}
            {hasAnyShade && (
              <Button
                variant="outline"
                size="sm"
                startIcon={<RotateCcw size={14} />}
                onClick={() => onSearchChange(NO_SHADES)}
              >
                {m.visualizer_reset()}
              </Button>
            )}
          </FormSection>

          <FormSection
            title={m.visualizer_presets()}
            description={m.visualizer_presets_hint()}
          >
            {isLoading ? (
              <SkeletonCell />
            ) : sets && sets.items.length > 0 ? (
              <div className="space-y-2">
                {sets.items.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    aria-pressed={isSetApplied(set)}
                    onClick={() => applySet(set)}
                    className={clsx(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isSetApplied(set)
                        ? "border-info bg-info-subtle"
                        : "border-border bg-surface hover:bg-surface-muted",
                    )}
                  >
                    <ColourSetSwatches shades={set.shades} />
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {set.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-faint">
                {m.visualizer_no_sets()}
              </p>
            )}
          </FormSection>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="h-112 overflow-hidden rounded-xl border border-border lg:h-140">
            <HouseViewer colours={colours} />
          </div>
          <p className="text-xs text-foreground-subtle">
            {m.visualizer_controls_hint()}
          </p>
        </div>
      </div>
    </>
  );
}
