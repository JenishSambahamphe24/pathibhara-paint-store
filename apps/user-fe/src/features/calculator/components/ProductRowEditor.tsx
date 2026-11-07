import type { IProductRow } from "../types";
import type { IPublicProductListItem } from "#/features/catalog/types";

import { X } from "lucide-react";

import { MAX_COATS, MIN_COATS } from "@repo/shared";

import { Stepper } from "./Stepper";

interface ProductRowEditorProps {
  row: IProductRow;
  // Grouped by category name, for the picker's sections.
  groups: ReadonlyArray<[string, ReadonlyArray<IPublicProductListItem>]>;
  products: ReadonlyMap<string, IPublicProductListItem>;
  canRemove: boolean;
  onChange: (row: IProductRow) => void;
  onRemove: () => void;
}

export function ProductRowEditor({
  row,
  groups,
  products,
  canRemove,
  onChange,
  onRemove,
}: ProductRowEditorProps) {
  const selected = products.get(row.productId);
  const selectId = `product-${row.id}`;

  return (
    <div className="flex flex-col gap-1.5 rounded-field border border-line bg-surface p-2">
      <div className="flex items-center justify-between">
        <label htmlFor={selectId} className="text-xs font-bold text-muted">
          {selected?.category.name ?? "Product"}
        </label>
        {canRemove && (
          <button
            type="button"
            aria-label={`Remove ${selected?.name ?? "this product"}`}
            onClick={onRemove}
            className="-my-2 flex size-tap items-center justify-center text-muted"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <select
          id={selectId}
          value={row.productId}
          onChange={(event) => {
            const next = products.get(event.target.value);
            onChange({
              ...row,
              productId: event.target.value,
              coats: next?.defaultCoats ?? row.coats,
            });
          }}
          className="min-h-tap min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 text-[15px] font-semibold text-ink"
        >
          {!selected && <option value="">Choose a product</option>}
          {groups.map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Stepper
          value={row.coats}
          min={MIN_COATS}
          max={MAX_COATS}
          size="sm"
          label={`${row.coats} ${row.coats === 1 ? "coat" : "coats"}`}
          lessLabel="One coat less"
          moreLabel="One coat more"
          onChange={(coats) => onChange({ ...row, coats })}
        />
      </div>
    </div>
  );
}
