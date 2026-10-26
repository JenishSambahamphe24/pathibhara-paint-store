import type { IVariantSummary } from "../types";

import { EntityPicker } from "#/components/EntityPicker/EntityPicker";

import { m } from "#/paraglide/messages";

import { VariantLabelHelper } from "../helpers/variantLabel.helper";
import { useVariantSearch } from "../hooks/useVariantSearch";

interface VariantPickerProps {
  label: string;
  value: string;
  selectedLabel?: string;
  onChange: (variant: IVariantSummary | null) => void;
  includeInactive?: boolean;
  hideLabel?: boolean;
  error?: string;
}

export function VariantPicker({
  label,
  value,
  selectedLabel,
  onChange,
  includeInactive = false,
  hideLabel = false,
  error,
}: VariantPickerProps) {
  const { setSearch, results, isLoading } = useVariantSearch(includeInactive);

  return (
    <div className="space-y-1">
      <EntityPicker
        label={label}
        hideLabel={hideLabel}
        placeholder={m.variant_picker_placeholder()}
        emptyText={m.variant_picker_empty()}
        value={value}
        selectedLabel={selectedLabel}
        isLoading={isLoading}
        options={results.map((variant) => ({
          value: variant.id,
          label: `${VariantLabelHelper.label(variant)} — ${m.variant_picker_stock({ count: variant.currentStock })}`,
        }))}
        onSearchChange={setSearch}
        onChange={(id) =>
          onChange(results.find((variant) => variant.id === id) ?? null)
        }
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
