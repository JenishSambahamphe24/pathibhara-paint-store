import type { ISectionDraft, TPresetId } from "../types";
import type { IPublicProductListItem } from "#/features/catalog/types";

import { clsx } from "clsx";
import { useMemo, useState } from "react";

import { SignBoard } from "#/components/SignBoard/SignBoard";

import { useHorizontalScroll } from "#/hooks/useHorizontalScroll";

import { CalculatorDraftHelper } from "../helpers/calculatorDraft.helper";
import { useEstimate } from "../hooks/useEstimate";
import { EstimatePanel } from "./EstimatePanel";
import { SectionEditor } from "./SectionEditor";
import { TotalBar } from "./TotalBar";

interface CalculatorPageProps {
  products: ReadonlyArray<IPublicProductListItem>;
  wastagePercent: number;
  // Products to start the exterior with, e.g. from the visualizer's shades.
  startWith: ReadonlyArray<IPublicProductListItem>;
}

const PRESETS: ReadonlyArray<[TPresetId, string]> = [
  ["room", "Standard 12 × 10 room"],
  ["exterior", "Single-storey exterior"],
  ["blank", "Start blank"],
];

// Phones: the form, then the estimate, with a running total pinned to the
// bottom. Desktop: the form on the left, the estimate sticky on the right.
export function CalculatorPage({
  products,
  wastagePercent,
  startWith,
}: CalculatorPageProps) {
  const presetRow = useHorizontalScroll<HTMLDivElement>();
  const initialPreset: TPresetId = startWith.length > 0 ? "exterior" : "room";
  const [preset, setPreset] = useState<TPresetId | null>(initialPreset);
  const [sections, setSections] = useState<Array<ISectionDraft>>(() =>
    CalculatorDraftHelper.preset(initialPreset, products, startWith),
  );

  const byId = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const groups = useMemo(() => {
    const map = new Map<string, Array<IPublicProductListItem>>();
    for (const product of products) {
      const list = map.get(product.category.name) ?? [];
      list.push(product);
      map.set(product.category.name, list);
    }
    return [...map.entries()];
  }, [products]);

  const { input, problems } = CalculatorDraftHelper.toInput(
    sections,
    wastagePercent,
  );
  const estimate = useEstimate(input);
  const active = sections.filter((section) => section.isOn);

  function choosePreset(id: TPresetId) {
    setPreset(id);
    setSections(CalculatorDraftHelper.preset(id, products, startWith));
  }

  function updateSection(next: ISectionDraft) {
    // An edit means the page no longer matches a preset.
    setPreset(null);
    setSections((current) =>
      current.map((section) => (section.key === next.key ? next : section)),
    );
  }

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 pt-[18px] pb-8 lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:pb-16">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-[1.4_1_560px] print:hidden">
        <SignBoard
          kicker="Litres · cans · rupees"
          title="Cost calculator"
          as="h1"
          size="lg"
          className="self-start"
        />
        <p className="m-0 text-base leading-[1.45] text-ink-soft">
          Add each wall in feet. We work out the paint, the cans to buy and the
          total.
        </p>
        <div
          ref={presetRow.ref}
          className={clsx(
            "-mx-4 flex scroll-px-4 gap-2 overflow-x-auto px-4 pt-0.5 pb-1 lg:mx-0 lg:px-0",
            presetRow.className,
          )}
        >
          {PRESETS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={preset === id}
              onClick={() => choosePreset(id)}
              className={clsx(
                "min-h-tap shrink-0 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap",
                preset === id
                  ? "border-ink bg-ink text-on-ink"
                  : "border-line bg-surface text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="What are you painting"
          className="flex gap-2"
        >
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              aria-pressed={section.isOn}
              onClick={() => updateSection({ ...section, isOn: !section.isOn })}
              className={clsx(
                "min-h-12 flex-1 rounded-control border-2 pt-[3px] font-display text-[22px] font-semibold uppercase",
                section.isOn
                  ? "border-ink bg-ink text-on-ink"
                  : "border-line bg-surface text-ink",
              )}
            >
              {section.isOn ? "✓ " : "+ "}
              {section.name}
            </button>
          ))}
        </div>

        {active.length === 0 && (
          <p className="m-0 rounded-field border border-dashed border-line bg-surface p-3.5 text-[15px]">
            Pick Interior, Exterior or both to start.
          </p>
        )}
        {active.map((section) => (
          <SectionEditor
            key={section.key}
            section={section}
            groups={groups}
            products={byId}
            fallbackProduct={CalculatorDraftHelper.defaultProducts(
              products,
              section.key,
            ).at(-1)}
            problem={problems[section.key]}
            onChange={updateSection}
          />
        ))}
      </div>

      <div className="min-w-0 lg:sticky lg:top-24 lg:flex-[1_1_380px] lg:pt-6">
        <EstimatePanel
          estimate={estimate}
          hasInput={input !== null}
          wallsMessage={CalculatorDraftHelper.wallsMessage(sections)}
        />
      </div>

      <TotalBar
        totalPaisa={
          input && estimate.result ? estimate.result.totalPaisa : null
        }
      />
    </div>
  );
}
