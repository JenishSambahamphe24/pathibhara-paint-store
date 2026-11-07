import type { IShade } from "#/types/shade";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useState } from "react";

interface ShadePickerProps {
  shades: ReadonlyArray<IShade>;
  selectedCode: string | null;
  heading: string;
  onPick: (code: string) => void;
}

// A sideways strip in the phone sheet; a searchable grid in the wide panel.
// Search only shows in the panel, so on phones the query stays empty.
export function ShadePicker({
  shades,
  selectedCode,
  heading,
  onPick,
}: ShadePickerProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? shades.filter(
        (shade) =>
          shade.code.toLowerCase().includes(needle) ||
          shade.name.toLowerCase().includes(needle),
      )
    : shades;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="shade-search"
        className="px-4 text-sm text-muted wide:px-0 wide:text-[15px]"
      >
        {heading}
      </label>
      <div className="hidden min-h-tap items-center gap-2 rounded-field border border-line bg-surface px-3 wide:flex">
        <Search size={18} aria-hidden="true" className="text-muted" />
        <input
          id="shade-search"
          type="search"
          placeholder="Search code or name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pt-2 wide:grid wide:grid-cols-[repeat(auto-fill,minmax(56px,1fr))] wide:overflow-visible wide:px-0">
        {visible.map((shade) => {
          const isSelected = shade.code === selectedCode;
          return (
            <button
              key={shade.code}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${shade.code} ${shade.name}`}
              title={shade.name}
              onClick={() => onPick(shade.code)}
              className={clsx(
                "flex w-14 shrink-0 flex-col overflow-hidden rounded-lg bg-surface text-left motion-safe:transition-transform wide:w-auto",
                isSelected
                  ? "border-2 border-ink outline-2 outline-offset-2 outline-ink motion-safe:-translate-y-1.5"
                  : "border border-line",
              )}
            >
              <span
                className="block h-14"
                style={{ backgroundColor: shade.hex }}
              />
              <span className="truncate px-1.5 py-1 text-[11px] font-semibold text-ink">
                {isSelected && "✓ "}
                {shade.code}
              </span>
            </button>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="m-0 text-sm text-muted">
          No shade matches that. Try a shade code or a colour name.
        </p>
      )}
    </div>
  );
}
