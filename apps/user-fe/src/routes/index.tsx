import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-3xl font-bold">Pathibhara Paints</h1>
      <p className="text-foreground-subtle">Customer site coming soon.</p>
    </main>
  );
}
