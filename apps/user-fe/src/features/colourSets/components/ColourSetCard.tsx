import type { IPublicColourSet } from "../types";

import { clsx } from "clsx";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

interface ColourSetCardProps {
  colourSet: IPublicColourSet;
  selected: boolean;
  onSelect: () => void;
}

export function ColourSetCard({
  colourSet,
  selected,
  onSelect,
}: ColourSetCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={clsx(
        "flex min-h-[88px] w-40 shrink-0 flex-col gap-2 rounded-field bg-surface p-2.5 text-left text-ink lg:w-auto",
        selected
          ? "border-2 border-ink outline-2 outline-offset-2 outline-ink"
          : "border border-line",
      )}
    >
      <span className="flex h-10 gap-[3px] lg:h-9" aria-hidden="true">
        {VISUALIZER_COMPONENTS.map((part) => (
          <span
            key={part}
            className="flex-1 rounded-[3px] border border-black/15"
            style={{ backgroundColor: colourSet.shades[part].hex }}
          />
        ))}
      </span>
      <span className="text-sm leading-tight font-semibold lg:text-[15px]">
        {colourSet.name}
      </span>
    </button>
  );
}
