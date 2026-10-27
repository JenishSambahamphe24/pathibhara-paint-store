import type { ReactNode } from "react";

import clsx from "clsx";

interface DashboardCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DashboardCard({ title, description, action, className, children }: DashboardCardProps) {
  return (
    <section className={clsx("rounded-xl border border-border bg-surface p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-foreground-subtle">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
