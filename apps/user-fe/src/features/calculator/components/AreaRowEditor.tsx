import type { IAreaRow } from "../types";

import { clsx } from "clsx";
import { CircleAlert, X } from "lucide-react";

import { CalculatorDraftHelper } from "../helpers/calculatorDraft.helper";
import { Stepper } from "./Stepper";
import { WallShape } from "./WallShape";

const MAX_QUANTITY = 500;

interface AreaRowEditorProps {
  row: IAreaRow;
  kind: "surface" | "opening";
  scale: number;
  onChange: (row: IAreaRow) => void;
  onRemove: () => void;
}

// A wall (name, width × height × how many), or a door or window taken off
// the wall area: the same fields, drawn smaller.
export function AreaRowEditor({
  row,
  kind,
  scale,
  onChange,
  onRemove,
}: AreaRowEditorProps) {
  const isSurface = kind === "surface";
  const name =
    row.label.trim() || (isSurface ? "this wall" : "this door or window");
  const isUnsized = isSurface && !CalculatorDraftHelper.isSized(row);
  const update = (patch: Partial<IAreaRow>) => onChange({ ...row, ...patch });

  return (
    <li
      className={clsx(
        "flex flex-col gap-2",
        isSurface && "border-b border-surface-2 px-3.5 py-3",
      )}
    >
      <div className={clsx("flex items-center", isSurface ? "gap-3" : "gap-2")}>
        <WallShape
          widthFt={CalculatorDraftHelper.feet(row.width)}
          heightFt={CalculatorDraftHelper.feet(row.height)}
          scale={scale}
          kind={kind}
        />
        <input
          type="text"
          value={row.label}
          aria-label={isSurface ? "Wall name" : "Door or window name"}
          onChange={(event) => update({ label: event.target.value })}
          className={clsx(
            "min-h-tap min-w-0 flex-1 border-b border-line bg-transparent px-1",
            isSurface ? "text-base font-semibold" : "text-[15px] font-medium",
          )}
        />
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="flex size-tap shrink-0 items-center justify-center text-muted"
        >
          <X size={isSurface ? 20 : 18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        {(["width", "height"] as const).map((field, index) => (
          <span key={field} className="contents">
            {index === 1 && (
              <span aria-hidden="true" className="text-muted">
                ×
              </span>
            )}
            <label
              className={clsx(
                "flex shrink-0 items-center rounded-field border bg-surface px-2",
                isSurface ? "min-h-[46px] w-[82px]" : "min-h-tap w-[72px]",
                isUnsized ? "border-danger" : "border-line",
              )}
            >
              <input
                type="text"
                inputMode="decimal"
                value={row[field]}
                aria-label={`${field === "width" ? "Width" : "Height"} of ${name} in feet`}
                aria-invalid={isUnsized || undefined}
                onChange={(event) => update({ [field]: event.target.value })}
                className={clsx(
                  "min-w-0 flex-1 bg-transparent pt-1 font-display text-ink outline-none",
                  isSurface ? "text-[26px]" : "text-[22px]",
                )}
              />
              <span className="text-[13px] text-muted">ft</span>
            </label>
          </span>
        ))}
        <span aria-hidden="true" className="text-muted">
          ×
        </span>
        <Stepper
          value={row.quantity}
          min={1}
          max={MAX_QUANTITY}
          size={isSurface ? "md" : "sm"}
          label={isSurface ? undefined : `× ${row.quantity}`}
          lessLabel={`One less of ${name}`}
          moreLabel={`One more of ${name}`}
          onChange={(quantity) => update({ quantity })}
        />
      </div>
      {isUnsized && (
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-danger">
          <CircleAlert size={16} aria-hidden="true" />
          Enter a width and height above 0 ft
        </span>
      )}
    </li>
  );
}
