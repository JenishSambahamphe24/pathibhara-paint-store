import type { VisualizerComponent } from "@repo/shared";

import { m } from "#/paraglide/messages";

export class VisualizerComponentHelper {
  static label(component: VisualizerComponent): string {
    switch (component) {
      case "main_surface":
        return m.visualizer_main_surface();
      case "columns":
        return m.visualizer_columns();
      case "doors_windows":
        return m.visualizer_doors_windows();
      case "roof_edge":
        return m.visualizer_roof_edge();
    }
  }
}
