import type { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

interface TanStackQueryProviderProps extends PropsWithChildren {
  queryClient: QueryClient;
}

export function TanStackQueryProvider({
  queryClient,
  children,
}: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
