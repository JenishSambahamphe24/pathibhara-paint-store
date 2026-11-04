import type { TLook } from "../types";
import type { IHouseSceneApi, IPartFlash } from "./HouseScene";
import type { TStageStatus } from "./HouseStage";
import type { VisualizerComponent } from "@repo/shared";
import type { IPublicColourSet } from "#/features/colourSets/types";
import type { IPublicShadeListItem } from "#/features/shades/types";

import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { ArrowLeft, MessageCircle, RotateCcw, Share2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { SignBoard } from "#/components/SignBoard/SignBoard";
import { Wordmark } from "#/components/Wordmark/Wordmark";

import { ColourSetCard } from "#/features/colourSets/components/ColourSetCard";
import { PAINT_PART_LABELS } from "#/features/colourSets/paintParts";
import { ContactHelper } from "#/lib/helpers/contact.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";

import { useMediaQuery } from "#/hooks/useMediaQuery";

import { LookHelper } from "../helpers/look.helper";
import { useIsWide } from "../hooks/useIsWide";
import { HouseStage } from "./HouseStage";
import { LookSwitch } from "./LookSwitch";
import { PartPicker } from "./PartPicker";
import { ShadePicker } from "./ShadePicker";
import { ShareSheet } from "./ShareSheet";

interface VisualizerPageProps {
  shades: ReadonlyArray<IPublicShadeListItem>;
  colourSets: ReadonlyArray<IPublicColourSet>;
  initialLook: TLook;
}

type TSheetTab = "shades" | "sets";

const ICON_BUTTON =
  "flex size-tap items-center justify-center rounded-lg border border-line bg-surface text-ink";

// Phones: the house on top, a bottom sheet with tabs below. Wide screens
// (tablets, desktops, phones turned sideways): the house fills the left and
// the controls sit in a side panel, with Look A and B side by side.
export function VisualizerPage({
  shades,
  colourSets,
  initialLook,
}: VisualizerPageProps) {
  const index = useMemo(() => LookHelper.index(shades), [shades]);
  const [looks, setLooks] = useState<[TLook, TLook]>(() => [
    initialLook,
    colourSets[1] ? LookHelper.fromColourSet(colourSets[1]) : initialLook,
  ]);
  const [editing, setEditing] = useState<0 | 1>(0);
  const [activePart, setActivePart] =
    useState<VisualizerComponent>("main_surface");
  const [tab, setTab] = useState<TSheetTab>("shades");
  const [wantsCompare, setWantsCompare] = useState(true);
  const [statusA, setStatusA] = useState<TStageStatus>("loading");
  const [flash, setFlash] = useState<IPartFlash | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const apiA = useRef<IHouseSceneApi>(null);
  const apiB = useRef<IHouseSceneApi>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);

  const isWide = useIsWide();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  // A second WebGL view only where there's room for it.
  const isComparing = isWide && wantsCompare && statusA !== "failed";

  const look = looks[editing];
  const shownA = isComparing ? looks[0] : look;
  const activeShade = LookHelper.shade(index, look[activePart]);
  const shareUrl = SeoHelper.absoluteUrl(
    `/visualizer?${new URLSearchParams(LookHelper.toSearch(look))}`,
  );
  // The calculator starts with the products the picked shades are mixed in.
  const estimateProducts = [
    ...new Set(
      VISUALIZER_COMPONENTS.flatMap((part) => {
        const code = look[part];
        const shade = code
          ? shades.find(
              (item) => item.code.toUpperCase() === code.toUpperCase(),
            )
          : undefined;
        return shade?.product ? [shade.product.slug] : [];
      }),
    ),
  ];
  const storeHref = ContactHelper.whatsappHref(
    LookHelper.message(look, index, shareUrl),
  );

  function updateLook(next: TLook) {
    setLooks((current) =>
      editing === 0 ? [next, current[1]] : [current[0], next],
    );
  }

  function pickPart(part: VisualizerComponent) {
    setActivePart(part);
    setTab("shades");
    // Under reduced motion the "Repainting" label names the part instead.
    if (!prefersReducedMotion) setFlash({ part, at: Date.now() });
  }

  function editingApi() {
    return isComparing && editing === 1 ? apiB : apiA;
  }

  function openShare() {
    setSnapshot(
      statusA === "ready" ? (editingApi().current?.snapshot() ?? null) : null,
    );
    shareDialog.current?.showModal();
  }

  function resetView() {
    apiA.current?.resetView();
    apiB.current?.resetView();
  }

  const loadingBadge = statusA === "loading" && (
    <span className="rounded-control bg-ink px-2.5 py-[3px] text-[13px] font-semibold text-on-ink">
      Loading 3D house…
    </span>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-ink wide:flex-row">
      <div className="relative flex h-[56%] shrink-0 gap-0.5 bg-line wide:h-auto wide:min-w-0 wide:flex-1">
        <HouseStage
          colours={LookHelper.colours(shownA, index)}
          label={`House. ${LookHelper.describe(shownA, index)}`}
          flash={!isComparing || editing === 0 ? flash : null}
          autoRotate={!prefersReducedMotion}
          apiRef={apiA}
          onStatusChange={setStatusA}
          caption={isComparing ? "Look A" : undefined}
          className="flex-1"
        />
        {isComparing && (
          <HouseStage
            colours={LookHelper.colours(looks[1], index)}
            label={`Look B. ${LookHelper.describe(looks[1], index)}`}
            flash={editing === 1 ? flash : null}
            autoRotate={!prefersReducedMotion}
            apiRef={apiB}
            onStatusChange={() => undefined}
            caption="Look B"
            className="flex-1"
          />
        )}

        <div className="absolute inset-x-2 top-2 flex items-center justify-between wide:hidden">
          <Link to="/" aria-label="Back to home" className={ICON_BUTTON}>
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <span
            aria-hidden="true"
            className="rounded-[5px] bg-sign-red p-[3px]"
          >
            <span className="block rounded-sign-inner border-2 border-pinstripe px-3.5 pt-1 font-display text-[26px] leading-none font-semibold tracking-[0.04em] text-sign-cream uppercase">
              Colour visualizer
            </span>
          </span>
          <button
            type="button"
            aria-label="Save or share this look"
            onClick={openShare}
            className={ICON_BUTTON}
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="absolute top-[62px] left-3 flex flex-wrap gap-1.5 wide:hidden">
          <span className="rounded-control border border-line bg-surface px-2.5 py-[3px] text-[13px] font-semibold">
            Repainting: {PAINT_PART_LABELS[activePart]}
          </span>
          {loadingBadge}
        </div>
        <div className="absolute inset-x-2 bottom-[46px] flex items-center justify-between wide:hidden">
          <LookSwitch
            value={editing}
            onChange={setEditing}
            label="Compare looks"
          />
          <button
            type="button"
            aria-label="Reset view"
            onClick={resetView}
            className={ICON_BUTTON}
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute top-3.5 left-3.5 hidden items-center gap-2.5 wide:flex">
          <Link to="/" aria-label="Pathibhara Paints, home">
            <Wordmark />
          </Link>
          {loadingBadge}
        </div>
        <div className="absolute top-3.5 right-3.5 hidden gap-2 wide:flex">
          <button
            type="button"
            aria-label="Reset view"
            onClick={resetView}
            className={ICON_BUTTON}
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Save or share this look"
            onClick={openShare}
            className={ICON_BUTTON}
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section
        aria-label="Choose colours"
        className="relative -mt-[38px] flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-t-[18px] border-t border-line bg-surface pt-2 pb-3 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] wide:mt-0 wide:flex-[0_0_clamp(300px,30%,400px)] wide:gap-3.5 wide:rounded-none wide:border-t-0 wide:border-l wide:px-4 wide:pt-3.5 wide:pb-4 wide:shadow-none"
      >
        <div
          aria-hidden="true"
          className="h-1 w-10 shrink-0 self-center rounded-full bg-line wide:hidden"
        />
        <SignBoard
          kicker="Paint the house first"
          title="Colour visualizer"
          as="h1"
          className="sr-only wide:not-sr-only"
        />

        <div
          role="tablist"
          aria-label="Choose by"
          className="mx-3 grid shrink-0 grid-cols-2 gap-[3px] rounded-lg bg-surface-2 p-[3px] wide:hidden"
        >
          {(
            [
              ["shades", "Pick shades"],
              ["sets", "Colour sets"],
            ] as const
          ).map(([id, name]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={clsx(
                "min-h-10 rounded-control text-[15px] font-semibold",
                tab === id
                  ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                  : "text-muted",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="hidden flex-col gap-2 wide:flex">
          <span className="text-xs font-bold tracking-[0.12em] text-muted uppercase">
            Editing
          </span>
          <LookSwitch
            value={editing}
            onChange={setEditing}
            label="Which look"
          />
          <label className="flex min-h-tap cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
            <input
              type="checkbox"
              checked={wantsCompare}
              onChange={(event) => setWantsCompare(event.target.checked)}
              className="size-5 accent-ink"
            />
            Show A and B side by side
          </label>
        </div>

        <div
          className={clsx(
            "flex-col gap-2 wide:flex",
            tab === "shades" ? "flex" : "hidden",
          )}
        >
          <PartPicker
            look={look}
            index={index}
            active={activePart}
            onPick={pickPart}
          />
          <ShadePicker
            shades={shades}
            selectedCode={activeShade?.code ?? null}
            heading={`${PAINT_PART_LABELS[activePart]} · ${activeShade ? `${activeShade.code} ${activeShade.name}` : "Original colour"}`}
            onPick={(code) =>
              updateLook(LookHelper.withShade(look, activePart, code))
            }
          />
        </div>

        {colourSets.length > 0 && (
          <div
            className={clsx(
              "flex-col gap-2 wide:flex",
              tab === "sets" ? "flex" : "hidden",
            )}
          >
            <span className="px-4 text-sm text-muted wide:hidden">
              One tap fills all four parts. Then change any part in Pick shades.
            </span>
            <h2 className="m-0 hidden text-xs font-bold tracking-[0.12em] text-muted uppercase wide:block">
              Colour sets
            </h2>
            <div className="flex gap-2.5 overflow-x-auto px-4 pt-1 pb-1.5 wide:grid wide:grid-cols-2 wide:overflow-visible wide:p-0">
              {colourSets.map((colourSet) => {
                const setLook = LookHelper.fromColourSet(colourSet);
                return (
                  <ColourSetCard
                    key={colourSet.slug}
                    colourSet={colourSet}
                    selected={LookHelper.equals(look, setLook)}
                    onSelect={() => updateLook(setLook)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 px-3 pt-0.5 wide:px-0">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/calculator"
              search={
                estimateProducts.length > 0
                  ? { products: estimateProducts.join(",") }
                  : {}
              }
              className={`${BUTTON_CLASSES.primary} min-h-[50px] px-2 text-[22px]`}
            >
              Estimate this look
            </Link>
            <a
              href={storeHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BUTTON_CLASSES.whatsapp} min-h-[50px] px-2 text-[22px]`}
            >
              <MessageCircle size={18} aria-hidden="true" />
              Send to store
            </a>
          </div>
          <p className="m-0 px-1 text-xs leading-[1.35] text-muted wide:px-0">
            Screen colours are close, not exact. Check the shade card at the
            store before you buy.
          </p>
        </div>
      </section>

      <ShareSheet
        dialogRef={shareDialog}
        look={look}
        index={index}
        snapshot={snapshot}
        url={shareUrl}
      />
    </div>
  );
}
