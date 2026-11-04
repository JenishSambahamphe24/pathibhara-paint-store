import type { IEstimateResult } from "../types";
import type { CostEstimateInput } from "@repo/shared";

import { useEffect, useState } from "react";

import { CalculatorApi } from "../api";

const DEBOUNCE_MS = 350;

export type TEstimateState =
  | { status: "idle"; result: null }
  | { status: "loading"; result: IEstimateResult | null }
  | { status: "ready"; result: IEstimateResult }
  | { status: "failed"; result: IEstimateResult | null };

// Re-prices the estimate a moment after typing stops. A newer input aborts
// the request in flight, so a slow reply can never overwrite a newer total.
export function useEstimate(input: CostEstimateInput | null) {
  const [state, setState] = useState<TEstimateState>({
    status: "idle",
    result: null,
  });
  const [attempt, setAttempt] = useState(0);
  const key = input ? JSON.stringify(input) : null;

  useEffect(() => {
    if (!key) {
      setState({ status: "idle", result: null });
      return;
    }
    const controller = new AbortController();
    setState((current) => ({ status: "loading", result: current.result }));
    const timer = setTimeout(() => {
      CalculatorApi.estimate(
        JSON.parse(key) as CostEstimateInput,
        controller.signal,
      )
        .then((result) => setState({ status: "ready", result }))
        .catch(() => {
          if (controller.signal.aborted) return;
          setState((current) => ({ status: "failed", result: current.result }));
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((count) => count + 1) };
}
