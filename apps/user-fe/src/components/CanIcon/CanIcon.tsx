import { VolumeHelper } from "@repo/shared";

interface ICanSize {
  width: number;
  height: number;
  stroke: number;
}

const CAN_SIZES: Record<number, ICanSize> = {
  500: { width: 20, height: 24, stroke: 2.4 },
  1000: { width: 26, height: 31, stroke: 2.2 },
  4000: { width: 38, height: 46, stroke: 2 },
  10000: { width: 48, height: 58, stroke: 2 },
  20000: { width: 60, height: 72, stroke: 1.7 },
};

const PAIL_FROM_ML = 10000;
const DEFAULT_BAND_HEX = "#d8d0bf";

interface CanIconProps {
  volumeMl: number;
  bandHex?: string;
  showLabel?: boolean;
}

// Tins below 10 L, pails with a handle from 10 L. The outline follows the
// theme through currentColor; the band is paint, so it never does.
export function CanIcon({
  volumeMl,
  bandHex = DEFAULT_BAND_HEX,
  showLabel = true,
}: CanIconProps) {
  const isPail = volumeMl >= PAIL_FROM_ML;
  const size = CAN_SIZES[volumeMl] ?? CAN_SIZES[isPail ? 20000 : 4000];
  return (
    <span className="inline-flex flex-col items-center gap-1.5 text-ink">
      {isPail ? (
        <svg
          width={size.width}
          height={size.height}
          viewBox="0 0 48 58"
          fill="none"
          stroke="currentColor"
          strokeWidth={size.stroke}
          strokeLinejoin="round"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M8 16 Q24 0 40 16" />
          <path d="M6 16 L9.5 50 Q24 55 38.5 50 L42 16" />
          <path
            d="M8.4 30 H39.6 L38.6 41 H9.4 Z"
            fill={bandHex}
            stroke="none"
          />
          <ellipse cx="24" cy="16" rx="18" ry="4.5" />
        </svg>
      ) : (
        <svg
          width={size.width}
          height={size.height}
          viewBox="0 0 40 48"
          fill="none"
          stroke="currentColor"
          strokeWidth={size.stroke}
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 8 V41 Q4 45 20 45 Q36 45 36 41 V8" />
          <rect
            x="5"
            y="19"
            width="30"
            height="13"
            fill={bandHex}
            stroke="none"
          />
          <ellipse cx="20" cy="8" rx="16" ry="4" />
        </svg>
      )}
      {showLabel && (
        <span className="text-[13px] font-semibold tabular-nums">
          {VolumeHelper.label(volumeMl)}
        </span>
      )}
    </span>
  );
}
