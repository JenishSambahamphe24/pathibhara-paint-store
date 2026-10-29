// Builds the visualizer's house as public/models/house.glb.
//
//   node scripts/build-house-model.ts [output-path]
//
// Modelled on a modern three-storey Nepali house seen from the front (carport
// under two framed glass balconies, wood-clad right bay, roof terrace and a
// stair cover); the sides and back are filled in to match. Units are metres,
// +z faces the street.
//
// Materials named after VISUALIZER_COMPONENTS are repainted from a colour
// set; `fixed_*` ones keep their colour. The admin tests check the exported
// file against VISUALIZER_COMPONENTS, so a renamed component fails there. A
// Blender model can replace this file if it uses the same material names.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type TRange = [number, number];
type TFace = "front" | "back" | "left" | "right";

interface IWindowOptions {
  face: TFace;
  /** The wall's surface coordinate on the face's axis. */
  plane: number;
  /** Horizontal extent along the face (x for front/back, z for the sides). */
  along: TRange;
  height: TRange;
  /** Vertical glazing bars. */
  bars?: number;
}

// Colours of the reference render, used until a colour set repaints them.
const MATERIALS = {
  main_surface: { color: "#cdb8a2", roughness: 0.9 },
  columns: { color: "#f1efea", roughness: 0.85 },
  doors_windows: { color: "#1e2226", roughness: 0.5, metalness: 0.3 },
  roof_edge: { color: "#f4f2ee", roughness: 0.85 },
  // The flat top of each roof stays off-white whatever the colour set.
  fixed_roof: { color: "#f4f2ee", roughness: 0.85 },
  fixed_wood: { color: "#a8673a", roughness: 0.75 },
  fixed_wood_gap: { color: "#4a2c18", roughness: 0.9 },
  // Opaque but glossy: a clear coat over a dark tinted base, so the viewer's
  // environment shows up as sky reflections the way real glazing does.
  fixed_glass: {
    color: "#27333c",
    roughness: 0.05,
    metalness: 0.15,
    clearcoat: 1,
    ior: 1.52,
  },
  fixed_railing_glass: {
    color: "#a9c9c0",
    roughness: 0.05,
    metalness: 0.1,
    opacity: 0.35,
  },
  fixed_metal: { color: "#2a2d30", roughness: 0.4, metalness: 0.7 },
  fixed_plinth: { color: "#8f8d88", roughness: 0.95 },
  fixed_paving: { color: "#9b948b", roughness: 0.95 },
  fixed_grass: { color: "#6f8f4e", roughness: 1 },
  fixed_kerb: { color: "#c9c6bf", roughness: 0.95 },
} as const;

type TMaterialName = keyof typeof MATERIALS;

// Floor levels and the plan, read off the reference photo.
const FLOOR = 3.5;
const L1 = FLOOR;
const L2 = FLOOR * 2;
const ROOF = FLOOR * 3;
const X_LEFT = -5;
const X_RIGHT = 5;
const X_SPLIT = 0.2;
const Z_BACK = -6;
const Z_FRONT = 5;
const Z_UPPER_LEFT = 3.4;
const Z_CARPORT_WALL = 0.5;

const FRAME = 0.07;
const FRAME_DEPTH = 0.06;

class HouseModel {
  private readonly parts = new Map<
    TMaterialName,
    Array<THREE.BufferGeometry>
  >();

  box(material: TMaterialName, x: TRange, y: TRange, z: TRange): void {
    const geometry = new THREE.BoxGeometry(
      x[1] - x[0],
      y[1] - y[0],
      z[1] - z[0],
    );
    geometry.translate((x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2);
    // Untextured, so UVs would only add weight to the file.
    geometry.deleteAttribute("uv");
    const list = this.parts.get(material) ?? [];
    list.push(geometry);
    this.parts.set(material, list);
  }

  // A roof slab: its edges take the colour set's roof edge shade, while a
  // thin cap keeps the flat top off-white. The cap is inset so a rim of the
  // edge colour still frames the roof when seen from above.
  roofSlab(x: TRange, y: TRange, z: TRange): void {
    const inset = 0.08;
    this.box("roof_edge", x, y, z);
    this.box(
      "fixed_roof",
      [x[0] + inset, x[1] - inset],
      [y[1], y[1] + 0.01],
      [z[0] + inset, z[1] - inset],
    );
  }

  // A box given in face space: `along` and `normal` map to world axes by face.
  faceBox(
    material: TMaterialName,
    face: TFace,
    plane: number,
    along: TRange,
    y: TRange,
    normal: TRange,
  ): void {
    const outward = face === "front" || face === "right" ? 1 : -1;
    const n: TRange = [
      plane + outward * normal[0],
      plane + outward * normal[1],
    ];
    const depth: TRange = [Math.min(...n), Math.max(...n)];
    if (face === "front" || face === "back")
      this.box(material, along, y, depth);
    else this.box(material, depth, y, along);
  }

  window({ face, plane, along, height, bars = 1 }: IWindowOptions): void {
    const [a0, a1] = along;
    const [y0, y1] = height;
    const frame = (u: TRange, v: TRange) =>
      this.faceBox("doors_windows", face, plane, u, v, [0, FRAME_DEPTH]);
    this.faceBox("fixed_glass", face, plane, along, height, [0, 0.02]);
    frame([a0, a0 + FRAME], height);
    frame([a1 - FRAME, a1], height);
    frame(along, [y0, y0 + FRAME]);
    frame(along, [y1 - FRAME, y1]);
    for (let i = 1; i <= bars; i++) {
      const u = a0 + ((a1 - a0) * i) / (bars + 1);
      frame([u - FRAME / 2, u + FRAME / 2], height);
    }
    // A thin sill under the frame reads as depth at any distance.
    this.faceBox(
      "doors_windows",
      face,
      plane,
      [a0 - 0.05, a1 + 0.05],
      [y0 - 0.06, y0],
      [0, 0.12],
    );
  }

  glassRailing(face: TFace, plane: number, along: TRange, base: number): void {
    const top = base + 1.05;
    this.faceBox(
      "fixed_railing_glass",
      face,
      plane,
      along,
      [base + 0.05, top - 0.05],
      [-0.03, 0.0],
    );
    this.faceBox(
      "fixed_metal",
      face,
      plane,
      along,
      [top - 0.06, top],
      [-0.05, 0.02],
    );
    const posts = Math.max(2, Math.round((along[1] - along[0]) / 1.2) + 1);
    for (let i = 0; i < posts; i++) {
      const u = along[0] + ((along[1] - along[0]) * i) / (posts - 1);
      const span: TRange = [
        Math.max(along[0], u - 0.025),
        Math.min(along[1], u + 0.025),
      ];
      this.faceBox("fixed_metal", face, plane, span, [base, top], [-0.05, 0.0]);
    }
  }

  barRailing(face: TFace, plane: number, along: TRange, base: number): void {
    for (const y of [0.25, 0.5, 0.75, 1.0]) {
      this.faceBox(
        "fixed_metal",
        face,
        plane,
        along,
        [base + y - 0.03, base + y],
        [-0.04, 0.0],
      );
    }
    const posts = Math.max(2, Math.round((along[1] - along[0]) / 1.5) + 1);
    for (let i = 0; i < posts; i++) {
      const u = along[0] + ((along[1] - along[0]) * i) / (posts - 1);
      const span: TRange = [
        Math.max(along[0], u - 0.03),
        Math.min(along[1], u + 0.03),
      ];
      this.faceBox(
        "fixed_metal",
        face,
        plane,
        span,
        [base, base + 1.0],
        [-0.06, 0.0],
      );
    }
  }

  toScene(): THREE.Scene {
    const scene = new THREE.Scene();
    const house = new THREE.Group();
    house.name = "house";
    for (const [name, geometries] of this.parts) {
      const spec: {
        color: string;
        roughness: number;
        metalness?: number;
        opacity?: number;
        clearcoat?: number;
        ior?: number;
      } = MATERIALS[name];
      const base = {
        name,
        color: spec.color,
        roughness: spec.roughness,
        metalness: spec.metalness ?? 0,
        transparent: spec.opacity !== undefined,
        opacity: spec.opacity ?? 1,
      };
      // Physical properties export as glTF extensions (clearcoat, ior).
      const material =
        spec.clearcoat === undefined
          ? new THREE.MeshStandardMaterial(base)
          : new THREE.MeshPhysicalMaterial({
              ...base,
              clearcoat: spec.clearcoat,
              clearcoatRoughness: 0.03,
              ior: spec.ior ?? 1.5,
            });
      const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
      mesh.name = name;
      house.add(mesh);
    }
    scene.add(house);
    return scene;
  }
}

function buildHouse(): HouseModel {
  const h = new HouseModel();

  // Masses. The left bay steps back: a carport on the ground floor, framed
  // balconies above it.
  h.box("main_surface", [X_SPLIT, X_RIGHT], [0, ROOF], [Z_BACK, Z_FRONT]);
  h.box("main_surface", [X_LEFT, X_SPLIT], [0, L1], [Z_BACK, Z_CARPORT_WALL]);
  h.box("main_surface", [X_LEFT, X_SPLIT], [L1, ROOF], [Z_BACK, Z_UPPER_LEFT]);
  h.box(
    "fixed_plinth",
    [X_LEFT - 0.04, X_RIGHT + 0.04],
    [0, 0.35],
    [Z_BACK - 0.04, Z_CARPORT_WALL + 0.04],
  );
  // Proud of the wall on every exposed side: a face flush with the wall would
  // share its plane and flicker against it.
  h.box(
    "fixed_plinth",
    [X_SPLIT - 0.04, X_RIGHT + 0.04],
    [0, 0.35],
    [Z_CARPORT_WALL, Z_FRONT + 0.04],
  );

  // Roof slabs: the right bay's projects as a white band, the left bay's
  // carries the terrace.
  h.roofSlab(
    [X_SPLIT - 0.5, X_RIGHT + 0.25],
    [ROOF, ROOF + 0.45],
    [Z_BACK - 0.25, Z_FRONT + 0.6],
  );
  h.roofSlab(
    [X_LEFT - 0.15, X_SPLIT - 0.5],
    [ROOF - 0.3, ROOF + 0.05],
    [Z_BACK - 0.15, Z_UPPER_LEFT + 0.25],
  );

  // Terrace: corner pier, bar railing at the front and side, low back wall.
  h.box(
    "main_surface",
    [X_LEFT, X_LEFT + 0.45],
    [ROOF, ROOF + 1.6],
    [Z_UPPER_LEFT - 0.45, Z_UPPER_LEFT],
  );
  h.box(
    "roof_edge",
    [X_LEFT - 0.05, X_LEFT + 0.5],
    [ROOF + 1.6, ROOF + 1.7],
    [Z_UPPER_LEFT - 0.5, Z_UPPER_LEFT + 0.05],
  );
  h.barRailing(
    "front",
    Z_UPPER_LEFT,
    [X_LEFT + 0.45, X_SPLIT - 0.5],
    ROOF + 0.05,
  );
  h.barRailing("left", X_LEFT, [Z_BACK, Z_UPPER_LEFT - 0.45], ROOF + 0.05);
  h.box(
    "main_surface",
    [X_LEFT, X_SPLIT - 0.5],
    [ROOF, ROOF + 1.0],
    [Z_BACK, Z_BACK + 0.2],
  );
  h.box(
    "roof_edge",
    [X_LEFT - 0.05, X_SPLIT - 0.5],
    [ROOF + 1.0, ROOF + 1.08],
    [Z_BACK - 0.05, Z_BACK + 0.25],
  );

  // Stair cover on the right half of the roof, door onto the terrace.
  const stair = {
    x: [X_SPLIT + 0.2, X_RIGHT - 0.2] as TRange,
    z: [Z_BACK + 2.5, Z_FRONT - 0.3] as TRange,
  };
  h.box("main_surface", stair.x, [ROOF + 0.45, ROOF + 2.7], stair.z);
  h.roofSlab(
    [stair.x[0] - 0.12, stair.x[1] + 0.12],
    [ROOF + 2.7, ROOF + 3.0],
    [stair.z[0] - 0.12, stair.z[1] + 0.12],
  );
  h.faceBox(
    "doors_windows",
    "left",
    stair.x[0],
    [0.6, 1.6],
    [ROOF + 0.45, ROOF + 2.55],
    [0, 0.05],
  );
  h.window({
    face: "back",
    plane: stair.z[0],
    along: [2.2, 3.6],
    height: [ROOF + 1.4, ROOF + 2.3],
  });

  // Right bay front: horizontal wood cladding up to the second floor, a white
  // box framing the two stacked windows.
  h.box(
    "fixed_wood_gap",
    [X_SPLIT, X_RIGHT],
    [0.35, L2],
    [Z_FRONT, Z_FRONT + 0.05],
  );
  for (let y = 0.37; y + 0.14 <= L2; y += 0.16) {
    h.box(
      "fixed_wood",
      [X_SPLIT, X_RIGHT],
      [y, y + 0.14],
      [Z_FRONT + 0.05, Z_FRONT + 0.1],
    );
  }
  const panel = {
    x: [1.8, 4.6] as TRange,
    z: [Z_FRONT, Z_FRONT + 0.32] as TRange,
  };
  h.box("columns", panel.x, [1.15, 6.6], panel.z);
  h.window({
    face: "front",
    plane: panel.z[1],
    along: [2.0, 4.4],
    height: [4.4, 6.25],
    bars: 2,
  });
  h.window({
    face: "front",
    plane: panel.z[1],
    along: [2.0, 4.4],
    height: [1.4, 3.1],
    bars: 2,
  });
  h.window({
    face: "front",
    plane: Z_FRONT,
    along: [0.8, 2.3],
    height: [L2 + 0.7, ROOF - 0.35],
  });
  h.window({
    face: "front",
    plane: Z_FRONT,
    along: [3.1, 4.6],
    height: [L2 + 0.7, ROOF - 0.35],
  });

  // Carport: back wall with a window and the entrance, a slim front pillar.
  h.window({
    face: "front",
    plane: Z_CARPORT_WALL,
    along: [-3.3, -1.1],
    height: [1.0, 2.8],
    bars: 1,
  });
  h.faceBox(
    "doors_windows",
    "front",
    Z_CARPORT_WALL,
    [-0.85, 0.0],
    [0.35, 2.5],
    [0, 0.06],
  );
  h.box(
    "fixed_plinth",
    [-1.0, 0.15],
    [0, 0.35],
    [Z_CARPORT_WALL, Z_CARPORT_WALL + 0.9],
  );
  h.box(
    "columns",
    [X_LEFT + 0.05, X_LEFT + 0.4],
    [0, L1 - 0.3],
    [Z_FRONT - 0.05, Z_FRONT + 0.3],
  );

  // The white frame around the first-floor balcony: floor slab, the deep fin
  // on its right, and the second-floor balcony slab on top.
  const frameX: TRange = [X_LEFT - 0.1, X_SPLIT + 0.3];
  const balconyZ: TRange = [Z_UPPER_LEFT, Z_FRONT + 0.7];
  h.box(
    "columns",
    frameX,
    [L1 - 0.3, L1 + 0.15],
    [Z_CARPORT_WALL, balconyZ[1]],
  );
  h.box("columns", [X_SPLIT - 0.5, frameX[1]], [L1 - 0.3, L2 + 0.45], balconyZ);
  h.box("columns", frameX, [L2 - 0.05, L2 + 0.45], balconyZ);
  h.glassRailing(
    "front",
    balconyZ[1],
    [frameX[0] + 0.05, X_SPLIT - 0.5],
    L1 + 0.15,
  );
  h.glassRailing(
    "left",
    frameX[0],
    [Z_UPPER_LEFT, balconyZ[1] - 0.05],
    L1 + 0.15,
  );
  h.glassRailing(
    "front",
    balconyZ[1],
    [frameX[0] + 0.05, frameX[1] - 0.05],
    L2 + 0.45,
  );
  h.glassRailing(
    "left",
    frameX[0],
    [Z_UPPER_LEFT, balconyZ[1] - 0.05],
    L2 + 0.45,
  );
  h.window({
    face: "front",
    plane: Z_UPPER_LEFT,
    along: [-3.8, -1.2],
    height: [L1 + 0.15, L2 - 0.35],
    bars: 3,
  });
  h.window({
    face: "front",
    plane: Z_UPPER_LEFT,
    along: [-3.6, -1.4],
    height: [L2 + 0.45, ROOF - 0.5],
    bars: 2,
  });

  // Sides and back, which the reference doesn't show: regular windows per
  // floor in the same frames.
  for (const base of [0, L1, L2]) {
    const sill = base + 1.0;
    const head = base + 2.6;
    h.window({
      face: "right",
      plane: X_RIGHT,
      along: [-4.2, -2.6],
      height: [sill, head],
    });
    h.window({
      face: "right",
      plane: X_RIGHT,
      along: [0.4, 2.0],
      height: [sill, head],
    });
    h.window({
      face: "back",
      plane: Z_BACK,
      along: [-3.8, -2.2],
      height: [sill, head],
    });
    h.window({
      face: "back",
      plane: Z_BACK,
      along: [2.4, 4.0],
      height: [sill, head],
    });
    h.window({
      face: "left",
      plane: X_LEFT,
      along: [-4.2, -2.6],
      height: [sill, head],
    });
    if (base > 0)
      h.window({
        face: "left",
        plane: X_LEFT,
        along: [0.2, 1.8],
        height: [sill, head],
      });
    // A slab band per floor keeps the plain sides from reading as one block.
    if (base > 0) {
      h.box(
        "roof_edge",
        [X_LEFT - 0.06, X_RIGHT + 0.06],
        [base - 0.12, base + 0.06],
        [Z_BACK - 0.06, Z_BACK + 0.0],
      );
      h.box(
        "roof_edge",
        [X_RIGHT, X_RIGHT + 0.06],
        [base - 0.12, base + 0.06],
        [Z_BACK - 0.06, Z_FRONT],
      );
    }
  }
  h.window({
    face: "back",
    plane: Z_BACK,
    along: [-1.0, 1.0],
    height: [L1 + 1.6, L1 + 2.4],
    bars: 1,
  });
  h.faceBox(
    "doors_windows",
    "back",
    Z_BACK,
    [-0.5, 0.5],
    [0.35, 2.4],
    [0, 0.06],
  );

  // Site: paving across the front, a kerb, grass beyond.
  h.box("fixed_grass", [-20, 20], [-0.06, -0.01], [-20, 20]);
  h.box(
    "fixed_paving",
    [X_LEFT - 0.8, X_RIGHT + 0.8],
    [-0.01, 0.0],
    [Z_CARPORT_WALL - 0.5, Z_FRONT + 4.5],
  );
  h.box(
    "fixed_kerb",
    [X_LEFT - 0.8, X_RIGHT + 0.8],
    [0, 0.15],
    [Z_FRONT + 4.5, Z_FRONT + 4.8],
  );

  return h;
}

// GLTFExporter reads its own output through the browser's FileReader.
class NodeFileReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;

  readAsArrayBuffer(blob: Blob): void {
    void blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
}
(globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;

const output =
  process.argv[2] ??
  fileURLToPath(new URL("../public/models/house.glb", import.meta.url));
const glb = await new GLTFExporter().parseAsync(buildHouse().toScene(), {
  binary: true,
});
writeFileSync(output, Buffer.from(glb as ArrayBuffer));
console.warn(
  `Wrote ${output} (${Math.round((glb as ArrayBuffer).byteLength / 1024)} KB)`,
);
