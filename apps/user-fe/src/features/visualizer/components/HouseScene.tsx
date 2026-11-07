import type { VisualizerComponent } from "@repo/shared";
import type { ComponentRef, RefObject } from "react";
import type { MeshStandardMaterial } from "three";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Mesh, NoToneMapping, Vector3 } from "three";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

export const HOUSE_MODEL_URL = "/models/house.glb";

// The house faces +z; this corner view shows the front and the right side.
// Same framing as the admin visualizer.
const HOME_OFFSET = new Vector3(17, 4, 21);
const TARGET = new Vector3(0, 5, 0);
const MIN_DISTANCE = 14;
const MAX_DISTANCE = 45;
const FLASH_COLOUR = "#1e3a7b";
const FLASH_MS = 650;

export interface IHouseSceneApi {
  resetView: () => void;
  // A PNG data URL of what's on screen, for the share sheet.
  snapshot: () => string;
}

export interface IPartFlash {
  part: VisualizerComponent;
  // Changes on every tap, so tapping the same part twice flashes twice.
  at: number;
}

interface HouseSceneProps {
  colours: Partial<Record<VisualizerComponent, string>>;
  flash: IPartFlash | null;
  // False pauses rendering: off screen, or the tab is hidden.
  active: boolean;
  autoRotate: boolean;
  apiRef: RefObject<IHouseSceneApi | null>;
  onReady: () => void;
  // Inside a scrolling page (Home): no zoom, and vertical swipes scroll the
  // page, so the house never traps scrolling.
  isEmbedded?: boolean;
}

export function HouseScene({
  colours,
  flash,
  active,
  autoRotate,
  apiRef,
  onReady,
  isEmbedded = false,
}: HouseSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      // No tone mapping: the picked shade shows as true as a screen allows.
      // The drawing buffer is kept so the share sheet can take a picture.
      gl={{ toneMapping: NoToneMapping, preserveDrawingBuffer: true }}
      camera={{
        fov: 38,
        near: 2,
        far: 150,
        position: TARGET.clone().add(HOME_OFFSET),
      }}
      aria-hidden="true"
      // OrbitControls writes touch-action onto the canvas itself (none, or
      // auto when it reconnects), so embedded needs !important to keep
      // vertical swipes for the page; sideways ones still turn the house.
      className={isEmbedded ? "[&_canvas]:touch-pan-y!" : "touch-none"}
    >
      <hemisphereLight args={["#ffffff", "#b9b2a3", 2.7]} />
      <directionalLight
        position={[14, 22, 18]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-radius={4}
      />
      <Suspense fallback={null}>
        <House colours={colours} flash={flash} onReady={onReady} />
      </Suspense>
      <Controls
        autoRotate={autoRotate}
        apiRef={apiRef}
        isEmbedded={isEmbedded}
      />
    </Canvas>
  );
}

interface ControlsProps {
  autoRotate: boolean;
  apiRef: RefObject<IHouseSceneApi | null>;
  isEmbedded: boolean;
}

function Controls({ autoRotate, apiRef, isEmbedded }: ControlsProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, gl, scene, size } = useThree();
  // Turning the house stops the slow spin for good, as on the design.
  const [isSpinning, setIsSpinning] = useState(autoRotate);
  const aspect = size.width / size.height;
  // A tall phone stage needs the camera further back to fit the house.
  const distanceScale = aspect < 1 ? Math.min(1 / aspect ** 0.9, 2.4) : 1;

  useEffect(() => {
    camera.position.copy(TARGET).addScaledVector(HOME_OFFSET, distanceScale);
    controls.current?.target.copy(TARGET);
    controls.current?.update();
  }, [camera, distanceScale]);

  useImperativeHandle(
    apiRef,
    () => ({
      resetView: () => {
        camera.position
          .copy(TARGET)
          .addScaledVector(HOME_OFFSET, distanceScale);
        controls.current?.target.copy(TARGET);
        controls.current?.update();
      },
      snapshot: () => {
        gl.render(scene, camera);
        return gl.domElement.toDataURL("image/png");
      },
    }),
    [camera, distanceScale, gl, scene],
  );

  return (
    <OrbitControls
      ref={controls}
      target={TARGET}
      enablePan={false}
      enableZoom={!isEmbedded}
      enableDamping
      autoRotate={autoRotate && isSpinning}
      autoRotateSpeed={0.6}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE * distanceScale}
      // Stop just above the ground so the camera never looks from below.
      maxPolarAngle={Math.PI / 2 - 0.05}
      onStart={() => setIsSpinning(false)}
    />
  );
}

interface HouseProps {
  colours: Partial<Record<VisualizerComponent, string>>;
  flash: IPartFlash | null;
  onReady: () => void;
}

function House({ colours, flash, onReady }: HouseProps) {
  const { scene } = useGLTF(HOUSE_MODEL_URL);

  // useGLTF caches one scene per URL; each viewer (Look A and B) paints its
  // own copy.
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

  const materials = useMemo(() => {
    const byPart = new Map<VisualizerComponent, MeshStandardMaterial>();
    const originals = new Map<VisualizerComponent, string>();
    house.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const material = object.material as MeshStandardMaterial;
      const part = VISUALIZER_COMPONENTS.find((name) => name === material.name);
      if (!part) return;
      byPart.set(part, material);
      originals.set(part, `#${material.color.getHexString()}`);
    });
    return { byPart, originals };
  }, [house]);

  useEffect(() => {
    for (const [part, material] of materials.byPart) {
      // Color.set reads the hex as sRGB and converts it to the linear space
      // three renders in, so the swatch and the wall match.
      material.color.set(
        colours[part] ?? materials.originals.get(part) ?? "#ffffff",
      );
    }
  }, [colours, materials]);

  useEffect(() => {
    const material = flash && materials.byPart.get(flash.part);
    if (!material) return;
    material.emissive.set(FLASH_COLOUR);
    material.emissiveIntensity = 0.55;
    const timer = setTimeout(() => {
      material.emissive.set("#000000");
      material.emissiveIntensity = 1;
    }, FLASH_MS);
    return () => {
      clearTimeout(timer);
      material.emissive.set("#000000");
    };
  }, [flash, materials]);

  useEffect(onReady, [onReady]);

  return <primitive object={house} />;
}
