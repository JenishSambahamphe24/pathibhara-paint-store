import type { IProductListItem } from "../types";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EntityPicker } from "#/components/EntityPicker/EntityPicker";

import { m } from "#/paraglide/messages";

import { ProductApi } from "../api";

interface ProductPickerProps {
  label: string;
  value: string;
  selectedLabel?: string;
  onChange: (product: IProductListItem | null) => void;
  error?: string;
}

export function ProductPicker({
  label,
  value,
  selectedLabel,
  onChange,
  error,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, { wait: 250 });
  const { data, isFetching } = useQuery({
    queryKey: ["product-picker", debounced],
    queryFn: () =>
      ProductApi.list({
        search: debounced || undefined,
        status: "active",
        page: 1,
        perPage: 20,
        sortBy: "name",
        sortOrder: "asc",
      }),
    placeholderData: keepPreviousData,
  });
  const products = data?.items ?? [];

  return (
    <div className="space-y-1">
      <EntityPicker
        label={label}
        placeholder={m.product_picker_placeholder()}
        emptyText={m.product_picker_empty()}
        value={value}
        selectedLabel={selectedLabel}
        isLoading={isFetching}
        options={products.map((product) => ({
          value: product.id,
          label: product.name,
        }))}
        onSearchChange={setSearch}
        onChange={(id) =>
          onChange(products.find((product) => product.id === id) ?? null)
        }
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
