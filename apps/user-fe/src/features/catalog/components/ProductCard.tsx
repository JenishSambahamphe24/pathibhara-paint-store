import type { IPublicProductListItem } from "../types";

import { Link } from "@tanstack/react-router";

import { VolumeHelper } from "@repo/shared";

import { CanIcon } from "#/components/CanIcon/CanIcon";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";

interface ProductCardProps {
  product: IPublicProductListItem;
}

// No photo yet: a can and the category, so it still reads as a product.
export function ProductCard({ product }: ProductCardProps) {
  const sizes = product.volumesMl.map(VolumeHelper.toLitresString).join(" · ");

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="flex flex-col gap-1.5 text-ink"
    >
      <span className="relative block aspect-square overflow-hidden rounded-field bg-surface-2 lg:rounded-card">
        {product.coverImage ? (
          <img
            src={product.coverImage.url}
            alt={product.coverImage.alt ?? ""}
            width={product.coverImage.width ?? undefined}
            height={product.coverImage.height ?? undefined}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
            <CanIcon volumeMl={10000} showLabel={false} />
            <span className="px-2 text-center font-display text-lg leading-none font-semibold uppercase lg:text-[22px]">
              {product.category.name}
            </span>
          </span>
        )}
      </span>
      <span className="text-xs font-bold text-muted lg:text-[13px]">
        {product.category.name}
      </span>
      <span className="text-[15px] leading-tight font-bold wrap-anywhere lg:text-[17px]">
        {product.name}
      </span>
      {sizes && (
        <span className="text-[13px] text-muted lg:text-sm">{sizes} L</span>
      )}
      {product.minPricePaisa !== null && (
        <span className="font-display text-2xl leading-none font-medium lg:text-[28px]">
          From {CurrencyHelper.formatNpr(product.minPricePaisa)}
        </span>
      )}
    </Link>
  );
}
