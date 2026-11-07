import type { IEstimateResult } from "../types";
import type { CostEstimateInput } from "@repo/shared";

import { useEffect, useState } from "react";

import { ApiError } from "#/lib/apiError";

import { CalculatorApi } from "../api";

const DEBOUNCE_MS = 350;
const RATE_LIMITED = 429;

export type TEstimateState =
  | { status: "idle"; result: null }
  | { status: "loading"; result: IEstimateResult | null }
  | { status: "ready"; result: IEstimateResult }
  | {
      status: "failed";
      result: IEstimateResult | null;
      // The API refused because too many estimates came in a short time;
      // the message should say wait, not check the connection.
      isRateLimited: boolean;
    };

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
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const isRateLimited =
            error instanceof ApiError && error.status === RATE_LIMITED;
          setState((current) => ({
            status: "failed",
            result: current.result,
            isRateLimited,
          }));
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((count) => count + 1) };
}
