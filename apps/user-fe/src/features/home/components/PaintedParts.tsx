import type { VisualizerComponent } from "@repo/shared";
import type { IShade } from "#/types/shade";

import { clsx } from "clsx";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { Swatch } from "#/components/Swatch/Swatch";

import { PAINT_PART_LABELS } from "#/features/colourSets/paintParts";

interface PaintedPartsProps {
  shades: Record<VisualizerComponent, IShade>;
  className?: string;
}

// One bordered list on phones; separate small cards in a grid on desktop.
export function PaintedParts({ shades, className }: PaintedPartsProps) {
  return (
    <ul
      className={clsx(
        "m-0 list-none rounded-card border border-line bg-surface px-3.5 py-0.5 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0",
        className,
      )}
    >
      {VISUALIZER_COMPONENTS.map((part) => (
        <li
          key={part}
          className="flex min-h-12 items-center gap-3 border-b border-surface-2 last:border-b-0 lg:min-h-0 lg:gap-2.5 lg:rounded-field lg:border lg:border-line lg:bg-surface lg:px-2.5 lg:py-2 lg:last:border-b"
        >
          <Swatch hex={shades[part].hex} size={30} />
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2 lg:flex-col lg:items-start lg:gap-0 lg:leading-tight">
            <span className="text-[15px] font-semibold lg:text-sm lg:font-bold">
              {PAINT_PART_LABELS[part]}
            </span>
            <span className="text-right text-[13px] font-semibold text-muted lg:text-left lg:font-normal">
              {shades[part].code} · {shades[part].name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
