import { Skeleton } from "#/components/Skeleton/Skeleton";

interface PageSkeletonProps {
  kind: "grid" | "article" | "product";
}

const CARD_COUNT = 6;

// Shown by a route's pendingComponent when its data takes more than a moment
// (TanStack waits about a second first, so fast loads never flash it).
export function PageSkeleton({ kind }: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-4 pb-8 lg:px-6 lg:pt-7"
    >
      <Skeleton className="h-4 w-40" />
      {kind === "grid" && (
        <>
          <Skeleton className="h-11 w-2/3 max-w-sm" />
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] lg:gap-5">
            {Array.from({ length: CARD_COUNT }, (_, index) => (
              <li key={index} className="flex flex-col gap-1.5">
                <Skeleton className="aspect-square rounded-card" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </li>
            ))}
          </ul>
        </>
      )}
      {kind === "article" && (
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="aspect-video rounded-card" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      )}
      {kind === "product" && (
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
          <Skeleton className="aspect-square rounded-card lg:flex-1" />
          <div className="flex flex-col gap-3 lg:flex-1">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full rounded-card" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-[92px] rounded-field" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
