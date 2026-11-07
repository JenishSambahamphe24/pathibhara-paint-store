import type { IHouseSceneApi, IPartFlash } from "./HouseScene";
import type { VisualizerComponent } from "@repo/shared";
import type { ReactNode, RefObject } from "react";

import { clsx } from "clsx";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";

import { HouseIllustration } from "#/components/HouseIllustration/HouseIllustration";

import { UNPAINTED_HOUSE } from "#/features/colourSets/paintParts";

import { useIsOnline } from "#/hooks/useIsOnline";

// three.js and the model load only here, and only in the browser.
const HouseScene = lazy(() =>
  import("./HouseScene").then((module) => ({ default: module.HouseScene })),
);

export type TStageStatus = "loading" | "ready" | "failed";

const POSTER_URL = "/images/house-still.webp";

interface HouseStageProps {
  colours: Partial<Record<VisualizerComponent, string>>;
  label: string;
  flash: IPartFlash | null;
  autoRotate: boolean;
  apiRef: RefObject<IHouseSceneApi | null>;
  onStatusChange: (status: TStageStatus) => void;
  caption?: string;
  className?: string;
  // "tool" is the visualizer. "page" sits inside a scrolling page (Home): no
  // background of its own, the painted drawing while 3D loads instead of the
  // photo, no explanatory note, and the house never traps page scrolling.
  variant?: "tool" | "page";
  // Where the drawing sits in the "page" variant.
  drawingClassName?: string;
}

// Picture first, the 3D house once it loads, and the drawing when 3D can't
// run (no WebGL, or the model failed). The drawing repaints the same way, so
// no state is labelled an error.
export function HouseStage({
  colours,
  label,
  flash,
  autoRotate,
  apiRef,
  onStatusChange,
  caption,
  className,
  variant = "tool",
  drawingClassName,
}: HouseStageProps) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<TStageStatus>("loading");
  const [canRender3d, setCanRender3d] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const isOnline = useIsOnline();
  const isPage = variant === "page";
  const drawing = (
    <HouseIllustration
      colours={{ ...UNPAINTED_HOUSE, ...colours }}
      label={label}
      className={isPage ? drawingClassName : "w-full max-w-[480px]"}
    />
  );

  function changeStatus(next: TStageStatus) {
    setStatus(next);
    onStatusChange(next);
  }

  useEffect(() => {
    if (supportsWebgl()) setCanRender3d(true);
    else changeStatus("failed");
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let isOnScreen = true;
    const update = () => setIsActive(isOnScreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div
      ref={container}
      role="img"
      aria-label={label}
      className={clsx("relative min-w-0", !isPage && "bg-surface-2", className)}
    >
      {isPage && status !== "ready" && drawing}
      {!isPage && status === "loading" && (
        <img
          src={POSTER_URL}
          alt=""
          className="absolute inset-0 size-full object-contain"
        />
      )}
      {status === "failed"
        ? !isPage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 pt-16 pb-24 wide:p-6">
              {drawing}
              <p className="m-0 max-w-[460px] rounded-lg border border-line bg-surface px-3 py-2 text-[13px] leading-[1.4] wide:text-center wide:text-[15px]">
                {isOnline
                  ? "3D isn’t available on this device, so you’re seeing a drawing. Shades still change here, and the estimate works the same."
                  : "You’re offline. Showing the drawing until the 3D house can load. Shades still change."}
              </p>
            </div>
          )
        : canRender3d && (
            <SceneErrorBoundary onError={() => changeStatus("failed")}>
              <Suspense fallback={null}>
                <div
                  className={clsx(
                    "absolute inset-0 motion-safe:transition-opacity motion-safe:duration-300",
                    status === "ready" ? "opacity-100" : "opacity-0",
                  )}
                >
                  <HouseScene
                    colours={colours}
                    flash={flash}
                    active={isActive}
                    autoRotate={autoRotate}
                    apiRef={apiRef}
                    onReady={() => changeStatus("ready")}
                    isEmbedded={isPage}
                  />
                </div>
              </Suspense>
            </SceneErrorBoundary>
          )}
      {caption && (
        <span className="absolute bottom-3 left-3 rounded-[4px] bg-surface px-2 py-0.5 text-[13px] font-bold">
          {caption}
        </span>
      )}
    </div>
  );
}

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface SceneErrorBoundaryProps {
  onError: () => void;
  children: ReactNode;
}

// A model that fails to load throws from useGLTF; catch it here and show the
// drawing instead of taking the page down.
class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
