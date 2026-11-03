import { Link } from "@tanstack/react-router";

import { Wordmark } from "#/components/Wordmark/Wordmark";

import { NAV_ITEMS } from "../navItems";

// The store's details live on the pages (Home, Visit), not here.
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3.5 px-4 py-7 text-sm lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-12 lg:gap-y-6 lg:px-6 lg:py-8 lg:text-[15px]">
        <span className="hidden lg:block">
          <Wordmark />
        </span>
        <nav aria-label="Footer">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-3 p-0 font-semibold lg:flex lg:flex-wrap lg:gap-x-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="flex min-h-tap items-center">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="m-0 max-w-[360px] leading-[1.45] text-muted">
          Screen colours are close, not exact. Check the shade card in the store
          before you buy.
        </p>
      </div>
    </footer>
  );
}
