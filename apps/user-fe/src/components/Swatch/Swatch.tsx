interface SwatchProps {
  // Null shows hatching: the part keeps its own, unpicked colour.
  hex: string | null;
  size?: number;
}

const UNPICKED_PATTERN =
  "repeating-linear-gradient(45deg, var(--color-line) 0 4px, var(--color-surface) 4px 8px)";

// The surface-coloured frame keeps near-white and near-black paints visible
// on either theme.
export function Swatch({ hex, size = 26 }: SwatchProps) {
  return (
    <span className="inline-flex shrink-0 rounded-[7px] border border-swatch-frame-line bg-swatch-frame p-0.5">
      <span
        className="block rounded-[5px]"
        style={{
          width: size,
          height: size,
          background: hex ?? UNPICKED_PATTERN,
        }}
      />
    </span>
  );
}
