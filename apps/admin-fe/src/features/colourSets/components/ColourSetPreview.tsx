import type { VisualizerComponent } from "@repo/shared";
import type { IShadeSummary } from "#/features/shades/types";

import clsx from "clsx";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { Chip } from "#/components/Chip/Chip";
import { ColorSwatch } from "#/components/ColorSwatch/ColorSwatch";

import { m } from "#/paraglide/messages";

import { VisualizerComponentHelper } from "../helpers/visualizerComponent.helper";

interface ColourSetPreviewProps {
  /** A component without a shade yet is drawn in a neutral placeholder. */
  shades: Partial<Record<VisualizerComponent, IShadeSummary>>;
}

interface IPaintProps {
  fill?: string;
  className?: string;
}

// A flat front elevation, so a set can be judged while it's being picked.
// The 3D visualizer reads the same four components.
export function ColourSetPreview({ shades }: ColourSetPreviewProps) {
  // A class fill would override the attribute, so the placeholder class is
  // only applied when there's no shade to paint.
  function paint(component: VisualizerComponent): IPaintProps {
    const hex = shades[component]?.hex;
    return hex
      ? { fill: hex, className: "stroke-border-strong" }
      : { className: "fill-surface-subtle stroke-border-strong" };
  }

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 320 220"
        role="img"
        aria-label={m.colour_sets_preview_label()}
        className="w-full rounded-lg border border-border bg-surface-muted"
      >
        <rect
          x="40"
          y="70"
          width="240"
          height="130"
          {...paint("main_surface")}
        />
        <rect x="28" y="54" width="264" height="18" {...paint("roof_edge")} />
        <rect x="40" y="72" width="18" height="128" {...paint("columns")} />
        <rect x="262" y="72" width="18" height="128" {...paint("columns")} />
        <rect
          x="76"
          y="100"
          width="54"
          height="44"
          {...paint("doors_windows")}
        />
        <rect
          x="190"
          y="100"
          width="54"
          height="44"
          {...paint("doors_windows")}
        />
        <rect
          x="140"
          y="118"
          width="40"
          height="82"
          {...paint("doors_windows")}
        />
        <line
          x1="103"
          y1="100"
          x2="103"
          y2="144"
          className="stroke-border-strong"
        />
        <line
          x1="217"
          y1="100"
          x2="217"
          y2="144"
          className="stroke-border-strong"
        />
        <line
          x1="12"
          y1="200"
          x2="308"
          y2="200"
          className="stroke-foreground-faint"
        />
      </svg>

      <ul className="space-y-1.5">
        {VISUALIZER_COMPONENTS.map((component) => {
          const shade = shades[component];
          return (
            <li key={component} className="flex items-center gap-2 text-sm">
              {shade ? (
                <ColorSwatch hex={shade.hex} size="sm" />
              ) : (
                <span className="size-4 shrink-0 rounded border border-dashed border-border-strong" />
              )}
              <span className="w-32 shrink-0 text-foreground-muted">
                {VisualizerComponentHelper.label(component)}
              </span>
              <span
                className={clsx(
                  "min-w-0 truncate",
                  shade ? "text-foreground" : "text-foreground-faint",
                )}
              >
                {shade
                  ? `${shade.code} · ${shade.name}`
                  : m.colour_sets_not_picked()}
              </span>
              {shade && !shade.isActive && (
                <Chip variant="warning">{m.common_inactive()}</Chip>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
