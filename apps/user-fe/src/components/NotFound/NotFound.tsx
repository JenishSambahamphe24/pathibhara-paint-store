import { Link } from "@tanstack/react-router";

import { SignBoard } from "#/components/SignBoard/SignBoard";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 px-4 py-16">
      <SignBoard variant="notice" kicker="404" title="Page not found" as="h1" />
      <p className="m-0 text-base text-muted">
        This page has moved or never existed. Try the products, or ask us on
        WhatsApp.
      </p>
      <Link
        to="/"
        className="flex min-h-12 items-center rounded-control bg-ink px-5 pt-[3px] font-display text-[22px] leading-none font-semibold tracking-[0.04em] text-on-ink uppercase"
      >
        Back to home
      </Link>
    </div>
  );
}
