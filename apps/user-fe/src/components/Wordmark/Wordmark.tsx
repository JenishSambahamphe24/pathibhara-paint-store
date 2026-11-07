import { clsx } from "clsx";

interface WordmarkProps {
  size?: "md" | "lg";
  // Off when the surrounding element is already the red signboard, as in the
  // mobile header.
  framed?: boolean;
}

// The Devanagari line is part of the logo, the one place it appears (the site
// copy itself stays English; see design/DESIGN.md).
export function Wordmark({ size = "md", framed = true }: WordmarkProps) {
  const isLarge = size === "lg";
  const lettering = (
    <>
      <span
        lang="ne"
        className={clsx(
          "font-display font-medium",
          isLarge ? "text-2xl" : "text-[17px]",
        )}
      >
        पाथीभरा पेन्ट्स
      </span>
      <span
        className={clsx(
          "font-display font-semibold tracking-[0.03em] uppercase",
          isLarge ? "text-[40px]" : "text-[26px]",
        )}
      >
        Pathibhara Paints
      </span>
    </>
  );

  if (!framed) {
    return (
      <span className="flex flex-col leading-[0.88] text-sign-cream">
        {lettering}
      </span>
    );
  }

  return (
    <span className="inline-block rounded-sign bg-sign-red p-1">
      <span className="flex flex-col items-center rounded-sign-inner border-2 border-pinstripe px-3.5 pt-1 pb-0.5 leading-[0.88] text-sign-cream">
        {lettering}
      </span>
    </span>
  );
}
