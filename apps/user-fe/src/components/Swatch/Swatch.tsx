interface SwatchProps {
  hex: string;
  size?: number;
}

// The surface-coloured frame keeps near-white and near-black paints visible
// on either theme.
export function Swatch({ hex, size = 26 }: SwatchProps) {
  return (
    <span className="inline-flex rounded-[7px] border border-swatch-frame-line bg-swatch-frame p-0.5">
      <span
        className="block rounded-[5px]"
        style={{ width: size, height: size, backgroundColor: hex }}
      />
    </span>
  );
}
