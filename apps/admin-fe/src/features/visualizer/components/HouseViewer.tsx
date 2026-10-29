import type { VisualizerComponent } from "@repo/shared";
import type { MeshStandardMaterial } from "three";

import {
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { Mesh } from "three";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { m } from "#/paraglide/messages";

export const HOUSE_MODEL_URL = "/models/house.glb";

interface HouseViewerProps {
  /** `#rrggbb` per component; a missing one keeps the model's own colour. */
  colours: Partial<Record<VisualizerComponent, string>>;
}

// The house faces +z; this corner view shows the front and the right side.
const CAMERA_POSITION: [number, number, number] = [17, 9, 21];
const TARGET: [number, number, number] = [0, 5, 0];

export function HouseViewer({ colours }: HouseViewerProps) {
  return (
    <Canvas
      shadows
      // The camera stays 14 m+ away; a near plane well short of that keeps
      // depth precision high enough that thin parts don't flicker.
      camera={{ position: CAMERA_POSITION, fov: 38, near: 2, far: 150 }}
      aria-label={m.visualizer_canvas_label()}
      role="img"
    >
      <color attach="background" args={["#eef2f6"]} />
      <hemisphereLight args={["#ffffff", "#8a8f7a", 0.5]} />
      <directionalLight
        position={[14, 22, 18]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
        // Without a normal bias, walls facing away from the sun streak and
        // shimmer with their own shadow ("acne") as the camera moves.
        shadow-normalBias={0.04}
      />
      {/* Reflections for the glass, built from light panels in the scene
          itself, so no HDR file is downloaded. */}
      <Environment resolution={256} environmentIntensity={0.7}>
        <Lightformer
          form="rect"
          color="#dce8f5"
          intensity={2}
          scale={[60, 14, 1]}
          position={[0, 14, -30]}
        />
        <Lightformer
          form="rect"
          color="#dce8f5"
          intensity={2}
          scale={[60, 14, 1]}
          position={[0, 14, 30]}
          rotation-y={Math.PI}
        />
        <Lightformer
          form="rect"
          color="#ffffff"
          intensity={3}
          scale={[30, 30, 1]}
          position={[0, 30, 0]}
          rotation-x={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          color="#c4d3e2"
          intensity={1}
          scale={[60, 10, 1]}
          position={[30, 8, 0]}
          rotation-y={-Math.PI / 2}
        />
        <Lightformer
          form="rect"
          color="#c4d3e2"
          intensity={1}
          scale={[60, 10, 1]}
          position={[-30, 8, 0]}
          rotation-y={Math.PI / 2}
        />
      </Environment>
      <Suspense fallback={null}>
        <House colours={colours} />
      </Suspense>
      <OrbitControls
        target={TARGET}
        enablePan={false}
        minDistance={14}
        maxDistance={45}
        // Stop just above the ground so the camera never looks from below.
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}

interface HouseProps {
  colours: Partial<Record<VisualizerComponent, string>>;
}

function House({ colours }: HouseProps) {
  const { scene } = useGLTF(HOUSE_MODEL_URL);

  // useGLTF caches one scene per URL; each viewer paints its own copy.
  const house = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.material = (object.material as MeshStandardMaterial).clone();
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return copy;
  }, [scene]);

  const originals = useMemo(() => {
    const map = new Map<string, string>();
    house.traverse((object) => {
      if (object instanceof Mesh) {
        const material = object.material as MeshStandardMaterial;
        map.set(material.name, `#${material.color.getHexString()}`);
      }
    });
    return map;
  }, [house]);

  useEffect(() => {
    house.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const material = object.material as MeshStandardMaterial;
      const component = VISUALIZER_COMPONENTS.find((c) => c === material.name);
      if (!component) return;
      // Color.set treats the hex as sRGB and converts it to the linear space
      // three renders in, so the swatch and the wall match.
      material.color.set(
        colours[component] ?? originals.get(material.name) ?? "#ffffff",
      );
    });
  }, [house, colours, originals]);

  return <primitive object={house} />;
}

useGLTF.preload(HOUSE_MODEL_URL);
