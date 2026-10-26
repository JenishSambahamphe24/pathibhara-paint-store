import { createFileRoute, notFound } from "@tanstack/react-router";

import { DailySaleEntryPage } from "#/features/dailySales/components/DailySaleEntryPage";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/(core)/stock/sales/$date")({
  beforeLoad: ({ params }) => {
    if (!DATE_PATTERN.test(params.date)) throw notFound();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const navigate = Route.useNavigate();
  return (
    <DailySaleEntryPage
      date={date}
      onDateChange={(next) =>
        navigate({ to: "/stock/sales/$date", params: { date: next } })
      }
    />
  );
}
