import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

// A grey stand-in while a page loads; it shimmers only when the phone
// allows motion.
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block rounded-control bg-surface-2 motion-safe:animate-pulse",
        className,
      )}
    />
  );
}
