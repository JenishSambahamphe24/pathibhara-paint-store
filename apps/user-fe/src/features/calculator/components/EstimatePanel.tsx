import type { TEstimateState } from "../hooks/useEstimate";

import { clsx } from "clsx";
import { MessageCircle, RotateCcw } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { CanBreakdown } from "#/components/CanBreakdown/CanBreakdown";
import { SignBoard } from "#/components/SignBoard/SignBoard";

import { ContactHelper } from "#/lib/helpers/contact.helper";
import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";

import { CalculatorDraftHelper } from "../helpers/calculatorDraft.helper";

interface EstimatePanelProps {
  estimate: TEstimateState & { retry: () => void };
  hasInput: boolean;
  // Every wall as typed, for when the estimate can't be priced.
  wallsMessage: string;
}

export function EstimatePanel({
  estimate,
  hasInput,
  wallsMessage,
}: EstimatePanelProps) {
  const { result, status } = estimate;
  const shown = hasInput ? result : null;
  const totalMl = shown
    ? shown.sections
        .flatMap((section) => section.products)
        .reduce((sum, product) => sum + product.requiredMl, 0)
    : 0;
  const summary = shown
    ? CalculatorDraftHelper.summary(shown, SeoHelper.absoluteUrl("/calculator"))
    : "";

  return (
    <section
      id="estimate"
      aria-labelledby="estimate-title"
      aria-busy={status === "loading"}
      className="flex flex-col gap-3"
    >
      <SignBoard
        variant="notice"
        kicker="Sample prices · ask the store to confirm"
        title={<span id="estimate-title">Your estimate</span>}
        className="self-start"
      />

      {!shown && status === "loading" && (
        <p role="status" className="m-0 text-[15px] text-muted">
          Working out litres and cans…
        </p>
      )}
      {!shown && status === "idle" && (
        <p className="m-0 text-[15px] text-muted">
          Your litres, cans and total appear here as soon as one wall has a size
          and a product.
        </p>
      )}

      {status === "failed" && (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-field border border-danger bg-surface p-3 text-[15px]"
        >
          <span className="font-display text-[26px] leading-none font-semibold text-danger uppercase">
            Couldn’t work out the estimate
          </span>
          <span>
            {estimate.isRateLimited
              ? "Too many estimates in a short time. Wait a minute, then try again."
              : "Check your connection and try again."}
          </span>
          <button
            type="button"
            onClick={estimate.retry}
            className={`${BUTTON_CLASSES.primary} min-h-12 self-stretch text-[22px]`}
          >
            <RotateCcw size={18} aria-hidden="true" className="mr-1.5" />
            Try again
          </button>
          <a
            href={ContactHelper.whatsappHref(wallsMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES.whatsapp} min-h-12 self-stretch text-[22px]`}
          >
            <MessageCircle size={18} aria-hidden="true" />
            Send walls to store
          </a>
          <span className="text-[13px] text-muted">
            The WhatsApp message lists every wall size, so the store can work it
            out by hand.
          </span>
        </div>
      )}

      {shown && (
        <div
          className={clsx(
            "flex flex-col gap-3 motion-safe:transition-opacity",
            status === "loading" && "opacity-60",
          )}
        >
          {shown.sections.map((section) => (
            <div
              key={section.name}
              className="overflow-hidden rounded-card border border-line bg-surface"
            >
              <div className="flex items-baseline justify-between gap-2 bg-surface-2 px-3.5 py-2.5">
                <span className="pt-[3px] font-display text-[26px] font-semibold uppercase">
                  {section.name}
                </span>
                <span className="text-right text-[13px] text-muted">
                  {CalculatorDraftHelper.sqft(section.grossAreaSqft)} −{" "}
                  {CalculatorDraftHelper.sqft(section.deductionAreaSqft)} ={" "}
                  <strong className="text-ink">
                    {CalculatorDraftHelper.sqft(section.netAreaSqft)}
                  </strong>
                </span>
              </div>
              {section.products.map((product) => (
                <div
                  key={product.productId}
                  className="flex flex-col gap-2 border-b border-surface-2 px-3.5 py-3"
                >
                  <div className="flex items-baseline justify-between gap-2.5">
                    <span className="flex min-w-0 flex-col">
                      <strong className="text-[15px]">{product.name}</strong>
                      <span className="text-xs text-muted">
                        {CalculatorDraftHelper.sqft(product.areaSqft)} ×{" "}
                        {product.coats} ÷ {product.coverageSqftPerLitre} sq ft/L
                        {shown.wastagePercent > 0 &&
                          ` + ${shown.wastagePercent}% wastage`}
                      </span>
                    </span>
                    <span className="font-display text-[28px] leading-none font-medium whitespace-nowrap">
                      {CalculatorDraftHelper.litres(product.requiredMl)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2.5">
                    <CanBreakdown containers={product.containers} />
                    <span className="font-display text-[26px] leading-none font-medium whitespace-nowrap">
                      {CurrencyHelper.formatNpr(product.costPaisa)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <span className="text-sm font-bold">
                  {section.name} subtotal
                </span>
                <span className="font-display text-[30px] leading-none font-semibold">
                  {CurrencyHelper.formatNpr(section.subtotalPaisa)}
                </span>
              </div>
            </div>
          ))}

          <div className="flex items-end justify-between border-t-[3px] border-ink pt-2.5">
            <span className="flex flex-col">
              <span className="font-display text-[28px] leading-none font-semibold uppercase">
                Total
              </span>
              <span className="text-[13px] text-muted">
                {CalculatorDraftHelper.litres(totalMl)} of paint
              </span>
            </span>
            <span
              aria-live="polite"
              className="font-display text-[52px] leading-[0.85] font-semibold tabular-nums"
            >
              {CurrencyHelper.formatNpr(shown.totalPaisa)}
            </span>
          </div>

          <div className="flex flex-col gap-2 print:hidden">
            <a
              href={ContactHelper.whatsappShareHref(summary)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BUTTON_CLASSES.whatsapp} min-h-[52px] text-[23px]`}
            >
              <MessageCircle size={18} aria-hidden="true" />
              Share estimate on WhatsApp
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className={`${BUTTON_CLASSES.secondary} min-h-12 px-2 text-[22px]`}
              >
                Save as PDF
              </button>
              <a
                href={ContactHelper.whatsappHref(summary)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BUTTON_CLASSES.primary} min-h-12 px-2 text-[22px]`}
              >
                Send to store
              </a>
            </div>
          </div>
          <p className="m-0 text-[13px] leading-[1.45] text-muted">
            Coverage changes with wall texture and absorbency. Buying the next
            can up is usually cheaper per litre; the store can confirm before
            you pay.
          </p>
        </div>
      )}
    </section>
  );
}
