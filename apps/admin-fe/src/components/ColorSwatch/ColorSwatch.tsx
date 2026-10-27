import clsx from "clsx";

interface ColorSwatchProps {
  /** `#rrggbb` from the data. */
  hex: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "size-4 rounded",
  md: "size-6 rounded-md",
  lg: "size-10 rounded-lg",
};

// An SVG fill paints a colour that only exists at runtime without an inline
// style, which the styling rules forbid.
export function ColorSwatch({ hex, size = "md", className }: ColorSwatchProps) {
  return (
    <svg
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden
      className={clsx(
        "shrink-0 overflow-hidden border border-border",
        SIZES[size],
        className,
      )}
    >
      <rect width="1" height="1" fill={hex} />
    </svg>
  );
}
