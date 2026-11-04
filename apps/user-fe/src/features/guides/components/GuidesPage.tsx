import type { IPublicPostListItem } from "../types";
import type { IPage } from "#/types/api.types";

import { Link } from "@tanstack/react-router";

import { SignBoard } from "#/components/SignBoard/SignBoard";

import { DateHelper } from "#/lib/helpers/date.helper";

import { GuideCover } from "./GuideCover";

interface GuidesPageProps {
  guides: IPage<IPublicPostListItem>;
}

const PAGE_LINK =
  "flex min-h-tap items-center rounded-control border border-line bg-surface px-4 text-[15px] font-bold";

// The newest guide leads on the first page; the rest are rows on phones and
// a grid on desktop.
export function GuidesPage({ guides }: GuidesPageProps) {
  const { page, totalPages, total } = guides.pagination;
  const featured = page === 1 ? guides.items.at(0) : undefined;
  const rest = featured ? guides.items.slice(1) : guides.items;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-[18px] pb-8 lg:gap-7 lg:px-6 lg:pt-7 lg:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SignBoard
          kicker="From the shop counter"
          title="Painting guides"
          as="h1"
          size="lg"
        />
        <span className="text-sm text-muted">
          {total} {total === 1 ? "guide" : "guides"}
        </span>
      </div>

      {total === 0 && (
        <div className="flex flex-col gap-1.5 rounded-field border border-dashed border-line bg-surface p-5">
          <span className="font-display text-[26px] font-semibold uppercase">
            No guides yet
          </span>
          <span className="text-sm text-muted">
            Ask us on WhatsApp in the meantime; we answer paint questions every
            day.
          </span>
        </div>
      )}

      {featured && (
        <Link
          to="/guides/$slug"
          params={{ slug: featured.slug }}
          className="flex flex-col gap-2 text-ink lg:flex-row lg:flex-wrap lg:items-center lg:gap-7 lg:border-t-2 lg:border-ink lg:pt-6"
        >
          <GuideCover
            image={featured.coverImage}
            size="lg"
            eager
            className="aspect-[16/10] rounded-card lg:aspect-video lg:flex-[1.3_1_480px] lg:rounded-[14px]"
          />
          <span className="flex min-w-0 flex-col gap-2 lg:flex-[1_1_360px] lg:gap-3">
            <span className="text-xs font-bold tracking-[0.12em] text-brand uppercase lg:text-[13px]">
              {DateHelper.bsLong(featured.publishedAt)}
            </span>
            <span className="font-display text-[34px] leading-[0.92] font-semibold uppercase lg:text-[56px] lg:leading-[0.88]">
              {featured.title}
            </span>
            {featured.excerpt && (
              <span className="text-[15px] leading-[1.45] text-ink-soft lg:text-lg lg:leading-normal">
                {featured.excerpt}
              </span>
            )}
            <span className="hidden font-bold text-accent lg:inline">
              Read the guide →
            </span>
          </span>
        </Link>
      )}

      {rest.length > 0 && (
        <ul className="m-0 flex list-none flex-col p-0 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:gap-x-6 lg:gap-y-7">
          {rest.map((guide) => (
            <li key={guide.slug} className="border-t border-line lg:border-0">
              <Link
                to="/guides/$slug"
                params={{ slug: guide.slug }}
                className="grid grid-cols-[104px_1fr] gap-3 py-3.5 text-ink lg:flex lg:flex-col lg:gap-2.5 lg:py-0"
              >
                <GuideCover
                  image={guide.coverImage}
                  size="md"
                  className="aspect-square rounded-lg lg:aspect-[16/10] lg:rounded-field"
                />
                <span className="flex min-w-0 flex-col gap-1 lg:gap-2.5">
                  <span className="hidden text-[13px] font-bold tracking-[0.12em] text-brand uppercase lg:inline">
                    {DateHelper.bsLong(guide.publishedAt)}
                  </span>
                  <span className="text-[17px] leading-tight font-bold lg:text-[21px]">
                    {guide.title}
                  </span>
                  {guide.excerpt && (
                    <span className="hidden text-[15px] leading-normal text-ink-soft lg:inline">
                      {guide.excerpt}
                    </span>
                  )}
                  <span className="text-[13px] text-muted lg:hidden">
                    {DateHelper.bsLong(guide.publishedAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pages"
          className="flex items-center justify-between gap-3 pt-2"
        >
          {page > 1 ? (
            <Link
              to="/guides"
              search={{ page: page - 1 > 1 ? page - 1 : undefined }}
              rel="prev"
              className={PAGE_LINK}
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              to="/guides"
              search={{ page: page + 1 }}
              rel="next"
              className={PAGE_LINK}
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
