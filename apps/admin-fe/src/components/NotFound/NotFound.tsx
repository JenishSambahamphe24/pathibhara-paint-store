import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { m } from "#/paraglide/messages";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-7xl font-bold text-foreground-faint">404</p>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {m.not_found_title()}
        </h1>
        <p className="max-w-md text-sm text-foreground-subtle">
          {m.not_found_description()}
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <ArrowLeft size={16} />
        {m.not_found_back_to_dashboard()}
      </Link>
    </div>
  );
}
