import type { TVisualizerSearch } from "../visualizer.schemas";
import type { VisualizerComponent } from "@repo/shared";
import type { ReactNode } from "react";

import clsx from "clsx";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { ColorSwatch } from "#/components/ColorSwatch/ColorSwatch";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { ColourSetSwatches } from "#/features/colourSets/components/ColourSetSwatches";
import { VisualizerComponentHelper } from "#/features/colourSets/helpers/visualizerComponent.helper";
import {
  useColourSet,
  useColourSets,
} from "#/features/colourSets/hooks/useColourSets";
import { m } from "#/paraglide/messages";

import { HouseViewer } from "./HouseViewer";

interface VisualizerPageProps {
  search: TVisualizerSearch;
  onSearchChange: (patch: Partial<TVisualizerSearch>) => void;
}

// Customers will only ever see active sets; an inactive one still opens here
// from its edit drawer link so it can be checked before going live.
export function VisualizerPage({
  search,
  onSearchChange,
}: VisualizerPageProps) {
  const { data: sets, isLoading } = useColourSets({
    status: "active",
    page: 1,
    perPage: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const { data: selected } = useColourSet(search.colourSetId ?? null);

  const colours: Partial<Record<VisualizerComponent, string>> = selected
    ? Object.fromEntries(
        VISUALIZER_COMPONENTS.map((component) => [
          component,
          selected.shades[component].hex,
        ]),
      )
    : {};

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

      <div className="grid gap-5 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          <p className="text-sm font-semibold text-foreground">
            {m.visualizer_pick_set()}
          </p>
          <OptionButton
            isSelected={!search.colourSetId}
            onClick={() => onSearchChange({ colourSetId: undefined })}
          >
            <span className="text-sm text-foreground">
              {m.visualizer_reference_colours()}
            </span>
          </OptionButton>
          {isLoading ? (
            <SkeletonCell />
          ) : (
            sets?.items.map((set) => (
              <OptionButton
                key={set.id}
                isSelected={search.colourSetId === set.id}
                onClick={() => onSearchChange({ colourSetId: set.id })}
              >
                <ColourSetSwatches shades={set.shades} />
                <span className="min-w-0 truncate text-sm text-foreground">
                  {set.name}
                </span>
              </OptionButton>
            ))
          )}
          {sets && sets.items.length === 0 && (
            <p className="text-sm text-foreground-faint">
              {m.visualizer_no_sets()}
            </p>
          )}
        </div>

        <div className="space-y-3 lg:col-span-3">
          <div className="h-112 overflow-hidden rounded-xl border border-border lg:h-140">
            <HouseViewer colours={colours} />
          </div>
          <p className="text-xs text-foreground-subtle">
            {m.visualizer_controls_hint()}
          </p>
          {selected && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {VISUALIZER_COMPONENTS.map((component) => {
                const shade = selected.shades[component];
                return (
                  <li
                    key={component}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <ColorSwatch hex={shade.hex} />
                    <span className="text-foreground-muted">
                      {VisualizerComponentHelper.label(component)}
                    </span>
                    <span className="ml-auto truncate text-foreground">
                      {shade.code} · {shade.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

interface OptionButtonProps {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}

function OptionButton({ isSelected, onClick, children }: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={clsx(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        isSelected
          ? "border-info bg-info-subtle"
          : "border-border bg-surface hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}
