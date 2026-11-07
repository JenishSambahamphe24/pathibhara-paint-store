import type { TLook, TLookSearch, TLookSearchKey } from "../types";
import type { VisualizerComponent } from "@repo/shared";
import type { IPublicColourSet } from "#/features/colourSets/types";
import type { IShade } from "#/types/shade";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { PAINT_PART_LABELS } from "#/features/colourSets/paintParts";

// Short keys keep a shared link readable: ?w=S-0207&c=S-0318…
const SEARCH_KEYS: Record<VisualizerComponent, TLookSearchKey> = {
  main_surface: "w",
  columns: "c",
  doors_windows: "d",
  roof_edge: "r",
};

export type TShadeIndex = ReadonlyMap<string, IShade>;

export class LookHelper {
  static readonly EMPTY: TLook = {
    main_surface: null,
    columns: null,
    doors_windows: null,
    roof_edge: null,
  };

  // Codes are matched without case, so a hand-typed link still works.
  static index(shades: ReadonlyArray<IShade>): TShadeIndex {
    return new Map(shades.map((shade) => [shade.code.toUpperCase(), shade]));
  }

  static shade(index: TShadeIndex, code: string | null): IShade | undefined {
    return code ? index.get(code.toUpperCase()) : undefined;
  }

  // Unknown or retired codes fall back to the house's own colour.
  static fromSearch(search: TLookSearch, index: TShadeIndex): TLook {
    return LookHelper.map((part) => {
      const shade = LookHelper.shade(index, search[SEARCH_KEYS[part]] ?? null);
      return shade ? shade.code : null;
    });
  }

  static toSearch(look: TLook): TLookSearch {
    const search: TLookSearch = {};
    for (const part of VISUALIZER_COMPONENTS) {
      const code = look[part];
      if (code) search[SEARCH_KEYS[part]] = code;
    }
    return search;
  }

  static fromColourSet(colourSet: IPublicColourSet): TLook {
    return LookHelper.map((part) => colourSet.shades[part].code);
  }

  static equals(a: TLook, b: TLook): boolean {
    return VISUALIZER_COMPONENTS.every((part) => a[part] === b[part]);
  }

  static isEmpty(look: TLook): boolean {
    return VISUALIZER_COMPONENTS.every((part) => look[part] === null);
  }

  static withShade(
    look: TLook,
    part: VisualizerComponent,
    code: string,
  ): TLook {
    return { ...look, [part]: code };
  }

  // Hex per painted part, for the 3D house and the drawing; unpainted parts
  // are left out so each keeps its own colour.
  static colours(
    look: TLook,
    index: TShadeIndex,
  ): Partial<Record<VisualizerComponent, string>> {
    const colours: Partial<Record<VisualizerComponent, string>> = {};
    for (const part of VISUALIZER_COMPONENTS) {
      const shade = LookHelper.shade(index, look[part]);
      if (shade) colours[part] = shade.hex;
    }
    return colours;
  }

  // "S-0207 Sandstone", or "Original colour" for an unpainted part.
  static shadeLabel(
    look: TLook,
    part: VisualizerComponent,
    index: TShadeIndex,
  ): string {
    const shade = LookHelper.shade(index, look[part]);
    return shade ? `${shade.code} ${shade.name}` : "Original colour";
  }

  static describe(look: TLook, index: TShadeIndex): string {
    return VISUALIZER_COMPONENTS.map(
      (part) =>
        `${PAINT_PART_LABELS[part]}: ${LookHelper.shadeLabel(look, part, index)}`,
    ).join(", ");
  }

  // Pre-written for WhatsApp: one line per part, then the link that reopens
  // the look.
  static message(look: TLook, index: TShadeIndex, url: string): string {
    const lines = VISUALIZER_COMPONENTS.map(
      (part) =>
        `${PAINT_PART_LABELS[part]}: ${LookHelper.shadeLabel(look, part, index)}`,
    );
    return ["Hello, I'd like these colours for my house:", ...lines, url].join(
      "\n",
    );
  }

  private static map(fn: (part: VisualizerComponent) => string | null): TLook {
    return {
      main_surface: fn("main_surface"),
      columns: fn("columns"),
      doors_windows: fn("doors_windows"),
      roof_edge: fn("roof_edge"),
    };
  }
}
