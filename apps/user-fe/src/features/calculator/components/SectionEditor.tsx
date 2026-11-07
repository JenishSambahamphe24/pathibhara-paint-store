import type { IAreaRow, IProductRow, ISectionDraft } from "../types";
import type { IPublicProductListItem } from "#/features/catalog/types";

import { CircleAlert } from "lucide-react";

import { CalculatorDraftHelper } from "../helpers/calculatorDraft.helper";
import { AreaRowEditor } from "./AreaRowEditor";
import { ProductRowEditor } from "./ProductRowEditor";

const MAX_PRODUCTS = 10;
// The widest wall in a section is drawn this many px wide.
const SHAPE_PX = 52;

interface SectionEditorProps {
  section: ISectionDraft;
  groups: ReadonlyArray<[string, ReadonlyArray<IPublicProductListItem>]>;
  products: ReadonlyMap<string, IPublicProductListItem>;
  fallbackProduct: IPublicProductListItem | undefined;
  problem: string | undefined;
  onChange: (section: ISectionDraft) => void;
}

function newId(): string {
  return crypto.randomUUID();
}

export function SectionEditor({
  section,
  groups,
  products,
  fallbackProduct,
  problem,
  onChange,
}: SectionEditorProps) {
  const isExterior = section.key === "exterior";
  const largest = Math.max(
    1,
    ...section.surfaces.map((row) =>
      Math.max(
        CalculatorDraftHelper.feet(row.width),
        CalculatorDraftHelper.feet(row.height),
      ),
    ),
  );
  const scale = SHAPE_PX / largest;

  function replace<TKey extends "surfaces" | "deductions">(
    key: TKey,
    rows: Array<IAreaRow>,
  ) {
    onChange({ ...section, [key]: rows });
  }
  function updateRow(key: "surfaces" | "deductions", next: IAreaRow) {
    replace(
      key,
      section[key].map((row) => (row.id === next.id ? next : row)),
    );
  }
  function removeRow(key: "surfaces" | "deductions", id: string) {
    replace(
      key,
      section[key].filter((row) => row.id !== id),
    );
  }
  function updateProducts(rows: Array<IProductRow>) {
    onChange({ ...section, products: rows });
  }

  return (
    <section
      aria-labelledby={`section-${section.key}`}
      className="overflow-hidden rounded-card border border-line bg-surface"
    >
      <div className="flex items-end justify-between border-b-2 border-ink px-3.5 py-3">
        <h2
          id={`section-${section.key}`}
          className="m-0 font-display text-[34px] leading-[0.9] font-semibold uppercase"
        >
          {section.name}
        </h2>
        <span className="text-right leading-none">
          <span className="block text-xs font-semibold text-muted">
            Net area
          </span>
          <span
            aria-live="polite"
            className="font-display text-[32px] font-medium tabular-nums"
          >
            {CalculatorDraftHelper.sqft(CalculatorDraftHelper.netArea(section))}
          </span>
        </span>
      </div>

      {section.surfaces.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 px-3.5 py-5 text-center">
          <span aria-hidden="true" className="flex items-end gap-1.5">
            <span className="h-[38px] w-11 rounded-[2px] border-2 border-dashed border-muted" />
            <span className="h-[38px] w-[30px] rounded-[2px] border-2 border-dashed border-muted" />
            <span className="h-[22px] w-[52px] rounded-[2px] border-2 border-dashed border-muted" />
          </span>
          <span className="font-display text-[28px] leading-[0.95] font-semibold uppercase">
            No walls yet
          </span>
          <span className="max-w-[260px] text-sm text-muted">
            Add a wall and type its width and height. Use quantity for walls of
            the same size.
          </span>
        </div>
      )}

      <ul className="m-0 list-none p-0">
        {section.surfaces.map((row) => (
          <AreaRowEditor
            key={row.id}
            row={row}
            kind="surface"
            scale={scale}
            onChange={(next) => updateRow("surfaces", next)}
            onRemove={() => removeRow("surfaces", row.id)}
          />
        ))}
      </ul>
      <div className="px-3.5 py-2.5">
        <button
          type="button"
          onClick={() =>
            replace("surfaces", [
              ...section.surfaces,
              {
                id: newId(),
                label: isExterior ? "Outer wall" : "Wall",
                width: "12",
                height: "10",
                quantity: 1,
              },
            ])
          }
          className="min-h-12 w-full rounded-lg border-2 border-dashed border-ink pt-[3px] font-display text-[22px] font-semibold uppercase"
        >
          + Add wall
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-surface-2 px-3.5 pt-1 pb-3">
        <span className="pt-2 text-sm font-bold">
          Doors &amp; windows{" "}
          <span className="font-medium text-muted">
            (not painted, taken off)
          </span>
        </span>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {section.deductions.map((row) => (
            <AreaRowEditor
              key={row.id}
              row={row}
              kind="opening"
              scale={scale}
              onChange={(next) => updateRow("deductions", next)}
              onRemove={() => removeRow("deductions", row.id)}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            replace("deductions", [
              ...section.deductions,
              {
                id: newId(),
                label: "Window",
                width: "4",
                height: "4",
                quantity: 1,
              },
            ])
          }
          className="min-h-tap self-start text-[15px] font-bold text-accent hover:text-accent-hover"
        >
          + Add door or window
        </button>
      </div>

      <div className="flex flex-col gap-2.5 bg-surface-2 px-3.5 pt-3 pb-3.5">
        <span className="text-sm font-bold">Products and coats</span>
        {section.products.map((row) => (
          <ProductRowEditor
            key={row.id}
            row={row}
            groups={groups}
            products={products}
            canRemove={section.products.length > 1}
            onChange={(next) =>
              updateProducts(
                section.products.map((item) =>
                  item.id === next.id ? next : item,
                ),
              )
            }
            onRemove={() =>
              updateProducts(
                section.products.filter((item) => item.id !== row.id),
              )
            }
          />
        ))}
        {section.products.length < MAX_PRODUCTS && (
          <button
            type="button"
            onClick={() =>
              updateProducts([
                ...section.products,
                {
                  id: newId(),
                  productId: fallbackProduct?.id ?? "",
                  coats: fallbackProduct?.defaultCoats ?? 2,
                },
              ])
            }
            className="min-h-tap self-start text-[15px] font-bold text-accent hover:text-accent-hover"
          >
            + Add product
          </button>
        )}
        {problem && (
          <p
            role="alert"
            className="m-0 flex items-center gap-1.5 text-sm font-semibold text-danger"
          >
            <CircleAlert size={16} aria-hidden="true" />
            {problem}
          </p>
        )}
      </div>
    </section>
  );
}
