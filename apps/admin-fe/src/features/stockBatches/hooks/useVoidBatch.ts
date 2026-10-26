import { useMutation } from "@tanstack/react-query";

import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { useStockInvalidation } from "#/hooks/useStockInvalidation";

import { StockBatchApi } from "../api";

export function useVoidBatch(batchId: string) {
  const invalidate = useStockInvalidation();
  return useMutation({
    mutationFn: (reason: string) => StockBatchApi.void(batchId, { reason }),
    onSuccess: async () => {
      toaster.success({ description: m.batches_void_success() });
      await invalidate();
    },
  });
}
