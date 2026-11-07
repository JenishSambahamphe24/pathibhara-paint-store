import type { IEstimateContainer } from "@repo/shared";

import { VolumeHelper } from "@repo/shared";

import { CanIcon } from "#/components/CanIcon/CanIcon";

const MAX_CANS_DRAWN = 3;

interface CanBreakdownProps {
  containers: ReadonlyArray<Pick<IEstimateContainer, "volumeMl" | "count">>;
  bandHex?: string;
}

export function CanBreakdown({ containers, bandHex }: CanBreakdownProps) {
  return (
    <ul
      className="m-0 flex list-none flex-wrap items-end gap-5 p-0"
      aria-label="Cans to buy"
    >
      {containers.map(({ volumeMl, count }) => (
        <li key={volumeMl} className="flex flex-col items-center gap-1.5">
          <span className="flex items-end gap-1">
            {Array.from({ length: Math.min(count, MAX_CANS_DRAWN) }, (_, i) => (
              <CanIcon
                key={i}
                volumeMl={volumeMl}
                bandHex={bandHex}
                showLabel={false}
              />
            ))}
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {count} × {VolumeHelper.label(volumeMl)}
          </span>
        </li>
      ))}
    </ul>
  );
}
