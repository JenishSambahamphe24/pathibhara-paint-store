import type { VisualizerComponent } from "@repo/shared";

interface HouseIllustrationProps {
  colours: Record<VisualizerComponent, string>;
  label: string;
  className?: string;
}

const EDGE = { stroke: "#000000", strokeOpacity: 0.2 };
const GLASS = "#bcd0d6";

// The house as a flat drawing, painted per part. It stands in for the 3D
// model (house.glb) until that ships, and stays as its fallback; the brief
// accepts a static house plus swatches when WebGL is unavailable. Glass, wood
// cladding and railings keep their own colours, as on the real house.
export function HouseIllustration({
  colours,
  label,
  className,
}: HouseIllustrationProps) {
  const walls = colours.main_surface;
  const columns = colours.columns;
  const doors = colours.doors_windows;
  const roof = colours.roof_edge;

  return (
    <svg
      viewBox="0 0 340 250"
      role="img"
      aria-label={label}
      className={className}
    >
      <ellipse
        cx="170"
        cy="240"
        rx="168"
        ry="7"
        fill="#000000"
        fillOpacity="0.18"
      />
      <rect x="8" y="150" width="86" height="8" fill={roof} {...EDGE} />
      <rect x="12" y="158" width="6" height="78" fill={columns} {...EDGE} />
      <rect x="82" y="158" width="6" height="78" fill={columns} {...EDGE} />
      <rect x="92" y="158" width="208" height="78" fill={walls} {...EDGE} />
      <rect x="92" y="96" width="208" height="54" fill={walls} {...EDGE} />
      <rect x="92" y="38" width="208" height="50" fill={walls} {...EDGE} />
      <rect x="220" y="6" width="70" height="24" fill={walls} {...EDGE} />
      <rect x="88" y="150" width="216" height="8" fill={columns} {...EDGE} />
      <rect x="88" y="88" width="216" height="8" fill={columns} {...EDGE} />
      <rect x="92" y="38" width="10" height="198" fill={columns} {...EDGE} />
      <rect x="196" y="38" width="9" height="198" fill={columns} {...EDGE} />
      <rect x="290" y="38" width="10" height="198" fill={columns} {...EDGE} />
      <rect x="88" y="30" width="216" height="8" fill={roof} {...EDGE} />
      <rect x="214" y="0" width="82" height="6" fill={roof} {...EDGE} />
      <g stroke="#6e6c66" strokeWidth="1.5">
        <line x1="102" y1="14" x2="214" y2="14" />
        {[110, 130, 150, 170, 190, 210].map((x) => (
          <line key={x} x1={x} y1="14" x2={x} y2="30" />
        ))}
      </g>
      <rect x="112" y="44" width="62" height="102" fill="#8a5a3b" />
      <g stroke="#6e4730" strokeWidth="1">
        {[52, 60, 68, 76, 84, 104, 112, 120, 128, 136].map((y) => (
          <line key={y} x1="112" y1={y} x2="174" y2={y} />
        ))}
      </g>
      <rect
        x="216"
        y="48"
        width="64"
        height="32"
        fill={GLASS}
        stroke={doors}
        strokeWidth="4"
      />
      <line x1="248" y1="48" x2="248" y2="80" stroke={doors} strokeWidth="3" />
      <rect
        x="212"
        y="102"
        width="72"
        height="44"
        fill={GLASS}
        stroke={doors}
        strokeWidth="4"
      />
      <rect
        x="208"
        y="126"
        width="80"
        height="22"
        fill="#d9e6ea"
        fillOpacity="0.7"
        stroke="#6e6c66"
        strokeWidth="1.5"
      />
      <rect
        x="112"
        y="174"
        width="62"
        height="40"
        fill={GLASS}
        stroke={doors}
        strokeWidth="4"
      />
      <line
        x1="143"
        y1="174"
        x2="143"
        y2="214"
        stroke={doors}
        strokeWidth="3"
      />
      <rect
        x="222"
        y="178"
        width="28"
        height="58"
        fill={doors}
        stroke="#000000"
        strokeOpacity="0.25"
      />
      <rect
        x="258"
        y="178"
        width="26"
        height="36"
        fill={GLASS}
        stroke={doors}
        strokeWidth="4"
      />
    </svg>
  );
}
