import type { IPublicProduct } from "../types";

import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useState } from "react";

import { VolumeHelper } from "@repo/shared";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { CanIcon } from "#/components/CanIcon/CanIcon";

import { ContactHelper } from "#/lib/helpers/contact.helper";
import { CurrencyHelper } from "#/lib/helpers/currency.helper";

import { ProductHelper } from "../helpers/product.helper";

interface ProductPageProps {
  product: IPublicProduct;
}

const AVAILABILITY_TONE = {
  inStock: "text-success",
  lowStock: "text-warning",
  askInStore: "text-warning",
} as const;

// Phones stack photo then details; desktop puts them side by side.
export function ProductPage({ product }: ProductPageProps) {
  const variants = ProductHelper.sortedVariants(product);
  // The largest can starts selected: usually the best price per litre.
  const [selectedId, setSelectedId] = useState(variants.at(-1)?.id ?? null);
  const selected = variants.find((variant) => variant.id === selectedId);
  const smallest = variants.at(0);
  let savingNote = "";
  if (selected && smallest) {
    const saving = ProductHelper.savingPaisa(selected, smallest);
    if (saving) {
      savingNote = `Saves ${CurrencyHelper.formatNpr(saving)} vs ${selected.volumeMl / smallest.volumeMl} × ${VolumeHelper.label(smallest.volumeMl)} cans`;
    } else if (selected.id === smallest.id && variants.length > 1) {
      savingNote = "Smallest can";
    }
  }
  const cover = product.images.at(0);
  const side = ProductHelper.wallSideFt(product.coverageSqftPerLitre);
  const coats = product.defaultCoats;
  const coatsLabel = `${coats} ${coats === 1 ? "coat" : "coats"}`;
  const askMessage = selected
    ? `Hello, do you have ${product.name} in ${VolumeHelper.label(selected.volumeMl)}?`
    : `Hello, I'd like to ask about ${product.name}.`;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-4 pb-8 lg:px-6 lg:pt-6 lg:pb-16">
      <nav aria-label="Category path" className="px-4 pt-3 lg:px-0 lg:pt-0">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-0.5 p-0 text-sm lg:text-[15px]">
          <li>
            <Link
              to="/products"
              className="font-semibold text-accent underline underline-offset-2"
            >
              Products
            </Link>
          </li>
          {product.categoryPath.map((step) => (
            <li key={step.slug} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-muted">
                /
              </span>
              <Link
                to="/categories/$slug"
                params={{ slug: step.slug }}
                className="font-semibold text-accent underline underline-offset-2"
              >
                {step.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-muted">
              /
            </span>
            <span aria-current="page" className="font-bold">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">
        <div className="mx-4 aspect-square overflow-hidden rounded-[14px] bg-surface-2 lg:mx-0 lg:flex-1 lg:rounded-2xl">
          {cover ? (
            <img
              src={cover.url}
              alt={cover.alt ?? product.name}
              width={cover.width ?? undefined}
              height={cover.height ?? undefined}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 text-muted">
              <CanIcon volumeMl={20000} showLabel={false} />
              <span className="font-display text-[25px] font-semibold uppercase">
                {product.category.name}
              </span>
            </div>
          )}
        </div>

        <section className="flex flex-col gap-3.5 px-4 lg:flex-1 lg:px-0">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold tracking-[0.1em] text-brand uppercase">
              {product.category.name}
            </span>
            <h1 className="m-0 font-display text-5xl leading-[0.86] font-semibold uppercase lg:text-[64px]">
              {product.name}
            </h1>
            {product.description && (
              <p className="m-0 mt-1.5 text-base leading-normal whitespace-pre-line text-ink-soft">
                {product.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[96px_1fr] items-center gap-3.5 rounded-card border border-line bg-surface p-3.5">
            <div
              aria-hidden="true"
              className="relative size-24 rounded-control bg-surface-2"
            >
              <span className="absolute top-1 left-4 text-[11px] font-bold">
                {side} ft
              </span>
              {/* A wall in the product's own first shade, when it has any. */}
              <div
                className="absolute bottom-2.5 left-4 size-16 border border-black/20 bg-line"
                style={
                  product.shades[0]
                    ? { backgroundColor: product.shades[0].hex }
                    : undefined
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[32px] leading-[0.95] font-medium">
                1 L ≈ {product.coverageSqftPerLitre} sq ft
              </span>
              <span className="text-sm leading-snug text-ink-soft">
                About one {side} × {side} ft wall per coat. {coatsLabel}{" "}
                recommended.
              </span>
            </div>
          </div>

          {variants.length > 0 ? (
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="mb-2.5 p-0 text-base font-bold">
                Size{" "}
                <span className="text-[13px] font-medium text-muted">
                  · sample prices
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {variants.map((variant) => {
                  const isSelected = variant.id === selectedId;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedId(variant.id)}
                      className={clsx(
                        "flex min-h-[92px] flex-col gap-1 rounded-field bg-surface p-3 text-left text-ink",
                        isSelected
                          ? "border-2 border-ink outline-2 outline-offset-2 outline-ink"
                          : "border border-line",
                      )}
                    >
                      <span className="font-display text-[30px] leading-[0.9] font-semibold">
                        {VolumeHelper.label(variant.volumeMl)}
                      </span>
                      <span className="text-[15px] font-bold">
                        {CurrencyHelper.formatNpr(variant.pricePaisa)}
                      </span>
                      <span className="text-[13px] text-muted">
                        {CurrencyHelper.formatPerLitre(
                          variant.pricePaisa,
                          variant.volumeMl,
                        )}
                      </span>
                      <span
                        className={clsx(
                          "text-xs font-bold",
                          AVAILABILITY_TONE[variant.availability],
                        )}
                      >
                        {ProductHelper.availabilityLabel(variant.availability)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="m-0 rounded-field border border-dashed border-line bg-surface p-3.5 text-[15px]">
              No sizes on sale right now. Ask the store when it’s back.
            </p>
          )}

          {selected && (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-ink pt-3">
              <span
                aria-live="polite"
                className="font-display text-[46px] leading-[0.9] font-semibold"
              >
                {CurrencyHelper.formatNpr(selected.pricePaisa)}
              </span>
              <span className="text-sm font-bold text-success">
                {savingNote}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 lg:flex-row">
            <Link
              to="/calculator"
              search={{ products: product.slug }}
              className={`${BUTTON_CLASSES.primary} min-h-[52px] text-[23px] lg:flex-1`}
            >
              Calculate how much I need
            </Link>
            <a
              href={ContactHelper.whatsappHref(askMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BUTTON_CLASSES.secondary} min-h-[50px] text-[22px] lg:flex-1`}
            >
              Ask about this size
            </a>
          </div>

          <dl className="m-0 mt-1.5 grid grid-cols-[130px_1fr] gap-x-3 gap-y-2 border-t border-line pt-3 text-[15px]">
            <dt className="text-muted">Coverage</dt>
            <dd className="m-0">
              {product.coverageSqftPerLitre} sq ft per litre per coat
            </dd>
            <dt className="text-muted">Coats</dt>
            <dd className="m-0">{coats} recommended</dd>
            {variants.length > 0 && (
              <>
                <dt className="text-muted">Sizes</dt>
                <dd className="m-0">{ProductHelper.sizesLabel(variants)}</dd>
              </>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}
