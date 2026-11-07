import type { IPublicColourSet } from "#/features/colourSets/types";
import type { IHouseSceneApi } from "#/features/visualizer/components/HouseScene";
import type { TStageStatus } from "#/features/visualizer/components/HouseStage";

import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";

import { ColourSetCard } from "#/features/colourSets/components/ColourSetCard";
import { UNPAINTED_HOUSE } from "#/features/colourSets/paintParts";
import { HouseStage } from "#/features/visualizer/components/HouseStage";
import { LookHelper } from "#/features/visualizer/helpers/look.helper";
import { Config } from "#/lib/config";

import { useHorizontalScroll } from "#/hooks/useHorizontalScroll";
import { useMediaQuery } from "#/hooks/useMediaQuery";

import { PaintedParts } from "./PaintedParts";

interface HomeHeroProps {
  colourSets: Array<IPublicColourSet>;
  selected: IPublicColourSet | undefined;
  onSelect: (index: number) => void;
}

// Phones stack intro → house → sets → parts → actions. On desktop the copy,
// sets and actions run down the left with the house and its parts on the right.
export function HomeHero({ colourSets, selected, onSelect }: HomeHeroProps) {
  const setRow = useHorizontalScroll<HTMLDivElement>();
  const houseApi = useRef<IHouseSceneApi>(null);
  const [houseStatus, setHouseStatus] = useState<TStageStatus>("loading");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const colours = selected
    ? {
        main_surface: selected.shades.main_surface.hex,
        columns: selected.shades.columns.hex,
        doors_windows: selected.shades.doors_windows.hex,
        roof_edge: selected.shades.roof_edge.hex,
      }
    : UNPAINTED_HOUSE;

  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-3.5 [grid-template-areas:'intro'_'house'_'sets'_'parts'_'actions'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-y-[18px] lg:pt-9 lg:[grid-template-areas:'intro_house'_'sets_house'_'actions_house'_'._parts']">
      <div className="flex flex-col gap-2.5 px-4 pt-5 [grid-area:intro] lg:gap-[18px] lg:px-0 lg:pt-0">
        <span className="text-[13px] font-bold tracking-[0.12em] text-brand uppercase lg:text-sm">
          {Config.store.city} · Paint &amp; waterproofing
        </span>
        <h1 className="m-0 font-display text-[58px] leading-[0.82] font-semibold text-balance uppercase lg:text-[clamp(56px,7vw,104px)]">
          Paint the house here first.
        </h1>
        <p className="m-0 max-w-[480px] text-base leading-[1.45] text-ink-soft lg:text-lg lg:leading-normal">
          Tap a colour set to repaint the house. Then get litres, cans and the
          cost in rupees
          <span className="hidden lg:inline">
            , and send it all to us on WhatsApp
          </span>
          .
        </p>
      </div>

      <div className="flex flex-col gap-1.5 px-4 [grid-area:house] lg:gap-2.5 lg:px-0">
        <div className="relative h-[300px] overflow-hidden rounded-[14px] bg-stage lg:h-auto lg:min-h-[520px] lg:flex-1 lg:rounded-2xl">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-stage-ground lg:h-[110px]" />
          {/* The stage needs a sized box: it renders nothing at zero height. */}
          <div className="absolute inset-0">
            <HouseStage
              variant="page"
              colours={colours}
              label={
                selected
                  ? `House painted with the ${selected.name} colour set`
                  : "The house, not yet painted"
              }
              flash={null}
              autoRotate={!prefersReducedMotion}
              apiRef={houseApi}
              onStatusChange={setHouseStatus}
              className="size-full"
              drawingClassName="absolute inset-x-0 top-[26px] w-full lg:inset-x-[6%] lg:top-auto lg:bottom-[60px] lg:w-[88%]"
            />
          </div>
          {houseStatus === "ready" && (
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-3 lg:inset-x-3 lg:bottom-3">
              <span className="rounded-[4px] bg-surface/90 px-2 py-1 text-xs font-semibold text-ink lg:px-2.5 lg:text-[13px]">
                Drag sideways to turn
              </span>
              <button
                type="button"
                aria-label="Reset view"
                onClick={() => houseApi.current?.resetView()}
                className="flex size-tap items-center justify-center rounded-lg border border-line bg-surface text-ink"
              >
                <RotateCcw size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <p className="m-0 px-0.5 text-xs text-muted lg:px-0 lg:text-[13px]">
          Screen colours are close, not exact.
        </p>
      </div>

      {colourSets.length > 0 && (
        <div className="flex flex-col gap-2.5 [grid-area:sets]">
          <h2 className="m-0 px-4 text-base font-bold lg:px-0">Colour sets</h2>
          <div
            ref={setRow.ref}
            className={clsx(
              "flex scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-1 pb-1.5 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:overflow-visible lg:p-0",
              setRow.className,
            )}
          >
            {colourSets.map((colourSet, index) => (
              <ColourSetCard
                key={colourSet.slug}
                colourSet={colourSet}
                selected={colourSet === selected}
                onSelect={() => onSelect(index)}
              />
            ))}
          </div>
        </div>
      )}

      {selected && (
        <PaintedParts
          shades={selected.shades}
          className="mx-4 [grid-area:parts] lg:mx-0"
        />
      )}

      <div className="flex flex-col gap-2 px-4 [grid-area:actions] lg:flex-row lg:flex-wrap lg:gap-2.5 lg:px-0">
        <Link
          to="/visualizer"
          search={
            selected
              ? LookHelper.toSearch(LookHelper.fromColourSet(selected))
              : {}
          }
          className={`${BUTTON_CLASSES.primary} min-h-[52px] text-[23px] lg:flex-[1_1_240px]`}
        >
          Change any part
        </Link>
        <Link
          to="/calculator"
          className={`${BUTTON_CLASSES.secondary} min-h-[52px] text-[23px] lg:flex-[1_1_200px]`}
        >
          Estimate this look
        </Link>
      </div>
    </section>
  );
}
