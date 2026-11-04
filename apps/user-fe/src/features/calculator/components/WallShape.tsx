import { clsx } from "clsx";

interface WallShapeProps {
  widthFt: number;
  heightFt: number;
  // px per foot, shared across a section so walls compare at a glance.
  scale: number;
  kind: "surface" | "opening";
}

// A small sketch of the wall at its true proportions; openings are dashed
// because they're taken off, not painted.
export function WallShape({ widthFt, heightFt, scale, kind }: WallShapeProps) {
  const isSurface = kind === "surface";
  const box = isSurface ? 60 : 32;
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-end justify-center"
      style={{ width: box, height: box }}
    >
      <span
        className={clsx(
          "box-border block border-2 border-ink motion-safe:transition-[width,height]",
          isSurface ? "border-solid bg-surface-2" : "border-dashed bg-surface",
        )}
        style={{
          width: Math.min(box, Math.max(4, Math.round(widthFt * scale))),
          height: Math.min(box, Math.max(4, Math.round(heightFt * scale))),
        }}
      />
    </span>
  );
}
