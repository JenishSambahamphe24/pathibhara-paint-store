import type { IPublicPostListItem } from "#/features/guides/types";

import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";

import { DateHelper } from "#/lib/helpers/date.helper";

interface LatestGuidesProps {
  guides: Array<IPublicPostListItem>;
}

// The first guide leads with a wide cover on phones; the rest are compact
// rows. On desktop all three sit side by side.
export function LatestGuides({ guides }: LatestGuidesProps) {
  return (
    <section className="flex flex-col gap-3.5 px-4 lg:gap-5 lg:px-0">
      <div className="flex items-end justify-between gap-4">
        <h2 className="m-0 font-display text-4xl leading-[0.9] font-semibold uppercase lg:text-[52px] lg:leading-[0.85]">
          Guides
        </h2>
        <Link
          to="/guides"
          className="flex min-h-tap items-center text-[15px] font-semibold text-accent hover:text-accent-hover lg:text-base"
        >
          All guides
        </Link>
      </div>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-6">
        {guides.map((guide, index) => (
          <Link
            key={guide.slug}
            to="/guides/$slug"
            params={{ slug: guide.slug }}
            className={clsx(
              "text-ink lg:flex lg:flex-col lg:gap-2.5 lg:border-0 lg:pt-0",
              index === 0
                ? "flex flex-col gap-2"
                : "grid grid-cols-[96px_1fr] items-center gap-3 border-t border-line pt-3",
            )}
          >
            <span
              className={clsx(
                "block overflow-hidden rounded-field lg:aspect-[16/10]",
                index === 0 ? "aspect-video" : "aspect-square rounded-lg",
              )}
            >
              {guide.coverImage ? (
                <img
                  src={guide.coverImage.url}
                  alt={guide.coverImage.alt ?? ""}
                  width={guide.coverImage.width ?? undefined}
                  height={guide.coverImage.height ?? undefined}
                  loading="lazy"
                  className="size-full bg-surface-2 object-cover"
                />
              ) : (
                <span className="block size-full bg-pinstripe p-1 lg:p-1.5">
                  <span className="flex size-full items-center justify-center rounded-[4px] border-2 border-sign-ink font-display text-[22px] font-semibold text-sign-ink uppercase lg:text-[34px]">
                    Guide
                  </span>
                </span>
              )}
            </span>
            <span className="flex flex-col gap-1 lg:gap-2.5">
              <span className="text-xs font-bold tracking-[0.12em] text-brand uppercase lg:text-[13px]">
                {DateHelper.bsLong(guide.publishedAt)}
              </span>
              <span
                className={clsx(
                  "leading-tight font-semibold lg:text-[21px] lg:leading-[1.25]",
                  index === 0 ? "text-[19px]" : "text-base leading-[1.3]",
                )}
              >
                {guide.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
