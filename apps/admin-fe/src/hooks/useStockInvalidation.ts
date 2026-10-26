import { useQueryClient } from "@tanstack/react-query";

// Any stock change moves numbers on products, variants, the ledger and the
// stock lists, so they all refetch together.
export function useStockInvalidation() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [
        "stock-batches",
        "stock-batch",
        "daily-sales",
        "daily-sale",
        "stock-adjustments",
        "stock-movements",
        "products",
        "product",
        "variant-search",
      ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
}
