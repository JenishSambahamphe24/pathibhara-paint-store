import type { IShadeSummary } from "../types";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EntityPicker } from "#/components/EntityPicker/EntityPicker";

import { m } from "#/paraglide/messages";

import { ShadeApi } from "../api";

interface ShadePickerProps {
  label: string;
  value: string;
  /** The selected shade, for when it isn't in the current search results. */
  selected?: IShadeSummary;
  onChange: (shade: IShadeSummary | null) => void;
  error?: string;
}

export function ShadePicker({
  label,
  value,
  selected,
  onChange,
  error,
}: ShadePickerProps) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, { wait: 250 });
  const { data, isFetching } = useQuery({
    queryKey: ["shade-picker", debounced],
    queryFn: () =>
      ShadeApi.list({
        search: debounced || undefined,
        status: "active",
        page: 1,
        perPage: 30,
        sortBy: "code",
        sortOrder: "asc",
      }),
    placeholderData: keepPreviousData,
  });
  const shades = data?.items ?? [];

  return (
    <div className="space-y-1">
      <EntityPicker
        label={label}
        placeholder={m.shade_picker_placeholder()}
        emptyText={m.shade_picker_empty()}
        value={value}
        selectedLabel={
          selected ? `${selected.code} · ${selected.name}` : undefined
        }
        selectedSwatch={selected?.hex}
        isLoading={isFetching}
        options={shades.map((shade) => ({
          value: shade.id,
          label: `${shade.code} · ${shade.name}`,
          swatch: shade.hex,
        }))}
        onSearchChange={setSearch}
        onChange={(id) =>
          onChange(
            shades.find((shade) => shade.id === id) ??
              (selected?.id === id ? selected : null),
          )
        }
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
