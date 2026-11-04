import { clsx } from "clsx";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";

import { useIsTyping } from "#/hooks/useIsTyping";

interface TotalBarProps {
  totalPaisa: number | null;
}

// Replaces the contact bar on phones; the estimate's own WhatsApp buttons
// cover contacting the store. Like that bar, it steps aside while the
// keyboard is open.
export function TotalBar({ totalPaisa }: TotalBarProps) {
  const isTyping = useIsTyping();

  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-30 items-center justify-between gap-3 border-t border-line bg-surface px-3 pt-2.5 pb-[calc(14px+env(safe-area-inset-bottom))] lg:hidden print:hidden",
        isTyping ? "hidden" : "flex",
      )}
    >
      <span className="flex flex-col leading-none">
        <span className="text-xs font-semibold text-muted">Total so far</span>
        <span
          aria-live="polite"
          className="font-display text-[34px] font-semibold tabular-nums"
        >
          {totalPaisa === null ? "—" : CurrencyHelper.formatNpr(totalPaisa)}
        </span>
      </span>
      <a
        href="#estimate"
        className={`${BUTTON_CLASSES.primary} min-h-12 text-[22px]`}
      >
        See estimate
      </a>
    </div>
  );
}
