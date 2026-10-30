import { Link } from "@tanstack/react-router";

import { Wordmark } from "#/components/Wordmark/Wordmark";

import { Config } from "#/lib/config";
import { ContactHelper } from "#/lib/helpers/contact.helper";

import { NAV_ITEMS } from "../navItems";

export function SiteFooter() {
  const { store } = Config;

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-6">
        <div className="flex flex-col items-start gap-3">
          <Wordmark />
          <p className="m-0 text-sm text-muted">
            Paint and waterproofing in {store.city}.
          </p>
        </div>

        <section aria-labelledby="footer-visit">
          <h2
            id="footer-visit"
            className="m-0 mb-3 font-display text-[28px] leading-none font-semibold uppercase"
          >
            Visit the store
          </h2>
          <dl className="m-0 grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted">Address</dt>
            <dd className="m-0">
              {store.address}, {store.city}
            </dd>
            <dt className="text-muted">Open</dt>
            <dd className="m-0">{store.openingHours}</dd>
            <dt className="text-muted">Phone</dt>
            <dd className="m-0 font-semibold">
              <a href={ContactHelper.phoneHref()} className="text-accent">
                {store.phoneDisplay}
              </a>
            </dd>
          </dl>
        </section>

        <nav aria-label="Footer">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 p-0 text-[15px] font-semibold">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="flex min-h-tap items-center">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
