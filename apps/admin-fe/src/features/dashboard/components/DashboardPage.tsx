import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";

import { useAuth } from "#/features/auth/hooks/useAuth";
import { m } from "#/paraglide/messages";

export function DashboardPage() {
  const { admin } = useAuth();

  return (
    <>
      <BreadCrumb items={[{ title: m.sidebar_dashboard() }]} />

      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <h1 className="text-2xl font-semibold text-foreground">
          {m.dashboard_welcome({ name: admin?.name ?? "" })}
        </h1>
        <p className="mt-2 text-sm text-foreground-subtle">
          {m.dashboard_placeholder()}
        </p>
      </div>
    </>
  );
}
