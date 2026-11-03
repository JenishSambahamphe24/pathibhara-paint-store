import type { TShadeIndex } from "../helpers/look.helper";
import type { TLook } from "../types";
import type { VisualizerComponent } from "@repo/shared";

import { clsx } from "clsx";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { Swatch } from "#/components/Swatch/Swatch";

import { PAINT_PART_LABELS } from "#/features/colourSets/paintParts";

import { LookHelper } from "../helpers/look.helper";

const SHORT_LABELS: Record<VisualizerComponent, string> = {
  ...PAINT_PART_LABELS,
  doors_windows: "Doors & win.",
};

interface PartPickerProps {
  look: TLook;
  index: TShadeIndex;
  active: VisualizerComponent;
  onPick: (part: VisualizerComponent) => void;
}

// Four tiles in a row in the phone sheet; a 2×2 grid of rows that also show
// the shade code in the wide panel.
export function PartPicker({ look, index, active, onPick }: PartPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 px-3 wide:grid-cols-2 wide:px-0">
      {VISUALIZER_COMPONENTS.map((part) => {
        const shade = LookHelper.shade(index, look[part]);
        const isActive = part === active;
        return (
          <button
            key={part}
            type="button"
            aria-pressed={isActive}
            onClick={() => onPick(part)}
            className={clsx(
              "flex min-h-[70px] flex-col items-center gap-[5px] rounded-field px-1 py-[7px] text-ink wide:min-h-14 wide:flex-row wide:gap-2 wide:px-2 wide:py-1.5 wide:text-left",
              isActive
                ? "border-2 border-accent bg-surface-2"
                : "border border-line",
            )}
          >
            <Swatch hex={shade?.hex ?? null} />
            <span className="flex min-w-0 flex-col leading-[1.1] wide:leading-[1.2]">
              <span className="text-center text-xs font-semibold wide:text-left wide:text-sm wide:font-bold">
                <span className="wide:hidden">{SHORT_LABELS[part]}</span>
                <span className="hidden wide:inline">
                  {PAINT_PART_LABELS[part]}
                </span>
              </span>
              <span className="hidden truncate text-xs text-muted wide:block">
                {shade?.code ?? "Original"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
