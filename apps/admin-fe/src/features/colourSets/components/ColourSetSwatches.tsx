import type { TComponentShades } from "../types";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { ColorSwatch } from "#/components/ColorSwatch/ColorSwatch";

import { VisualizerComponentHelper } from "../helpers/visualizerComponent.helper";

interface ColourSetSwatchesProps {
  shades: TComponentShades;
}

export function ColourSetSwatches({ shades }: ColourSetSwatchesProps) {
  return (
    <span className="flex shrink-0 gap-0.5">
      {VISUALIZER_COMPONENTS.map((component) => (
        <span
          key={component}
          title={`${VisualizerComponentHelper.label(component)}: ${shades[component].code} · ${shades[component].name}`}
        >
          <ColorSwatch hex={shades[component].hex} />
        </span>
      ))}
    </span>
  );
}
