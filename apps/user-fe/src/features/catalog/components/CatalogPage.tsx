import type { IPublicCategory, IPublicProductListItem } from "../types";
import type { IPage } from "#/types/api.types";

import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";

import { ContactHelper } from "#/lib/helpers/contact.helper";

import { CategoryTreeHelper } from "../helpers/categoryTree.helper";
import { CatalogPager } from "./CatalogPager";
import { CategorySidebar } from "./CategorySidebar";
import { ProductCard } from "./ProductCard";

interface CatalogPageProps {
  categories: ReadonlyArray<IPublicCategory>;
  // Null on /products, the whole catalogue.
  current: IPublicCategory | null;
  products: IPage<IPublicProductListItem>;
}

const BACK_LINK =
  "flex min-h-tap items-center gap-1.5 self-start text-[15px] font-bold text-accent lg:hidden";

const CRUMB_LINK =
  "flex min-h-8 items-center font-semibold text-accent underline underline-offset-2 hover:text-accent-hover";

// Works for a tree of any depth: phones step down one level at a time with
// a link back up; desktop shows the whole tree in a sidebar.
export function CatalogPage({
  categories,
  current,
  products,
}: CatalogPageProps) {
  const children = CategoryTreeHelper.children(
    categories,
    current?.slug ?? null,
  );
  const parent = current?.path.at(-2) ?? null;
  const total = products.pagination.total;
  const countLabel = `${total} ${total === 1 ? "product" : "products"}`;

  return (
    <div className="mx-auto flex max-w-[1280px] items-start gap-8 px-4 pt-3 pb-8 lg:px-6 lg:pt-6 lg:pb-16">
      <CategorySidebar categories={categories} current={current} />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <nav aria-label="Category path">
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-0.5 p-0 text-sm lg:text-[15px]">
            <li className="flex items-center gap-1.5">
              {current ? (
                <Link to="/products" className={CRUMB_LINK}>
                  Products
                </Link>
              ) : (
                <span aria-current="page" className="font-bold">
                  Products
                </span>
              )}
            </li>
            {current?.path.map((step, index) => {
              const isLast = index === current.path.length - 1;
              return (
                <li
                  key={step.slug}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <span aria-hidden="true" className="text-muted">
                    /
                  </span>
                  {isLast ? (
                    <span
                      aria-current="page"
                      className="font-bold wrap-anywhere"
                    >
                      {step.name}
                    </span>
                  ) : (
                    <Link
                      to="/categories/$slug"
                      params={{ slug: step.slug }}
                      className={CRUMB_LINK}
                    >
                      {step.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <h1 className="m-0 font-display text-[46px] leading-[0.88] font-semibold wrap-anywhere uppercase lg:text-[64px] lg:leading-[0.85]">
            {current?.name ?? "All products"}
          </h1>
          <span className="hidden text-[15px] text-muted lg:inline">
            {countLabel} · sample prices
          </span>
        </div>
        {current?.description && (
          <p className="m-0 max-w-[640px] text-base leading-normal text-ink-soft">
            {current.description}
          </p>
        )}

        {current &&
          (parent ? (
            <Link
              to="/categories/$slug"
              params={{ slug: parent.slug }}
              className={BACK_LINK}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back to {parent.name}
            </Link>
          ) : (
            <Link to="/products" className={BACK_LINK}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back to all products
            </Link>
          ))}

        {children.length > 0 && (
          <>
            <ul
              aria-label="Categories"
              className="m-0 list-none overflow-hidden rounded-field border border-line bg-surface p-0 lg:hidden"
            >
              {children.map((child) => (
                <li
                  key={child.slug}
                  className="border-b border-surface-2 last:border-b-0"
                >
                  <Link
                    to="/categories/$slug"
                    params={{ slug: child.slug }}
                    className="flex min-h-[54px] items-center justify-between gap-3 px-3.5"
                  >
                    <span className="flex flex-col leading-tight">
                      <span className="text-base font-bold">{child.name}</span>
                      <span className="text-[13px] text-muted">
                        {child.productCount}{" "}
                        {child.productCount === 1 ? "product" : "products"}
                      </span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden flex-wrap gap-2 lg:flex">
              {children.map((child) => (
                <Link
                  key={child.slug}
                  to="/categories/$slug"
                  params={{ slug: child.slug }}
                  className="flex min-h-tap items-center rounded-full border border-line bg-surface px-3.5 text-[15px] font-semibold"
                >
                  {child.name}
                  <span className="ml-1 font-normal text-muted">
                    · {child.productCount}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="flex items-baseline justify-between pt-2 lg:hidden">
          <h2 className="m-0 text-base font-bold">{countLabel}</h2>
          <span className="text-[13px] text-muted">Sample prices</span>
        </div>

        {total === 0 ? (
          <div className="flex flex-col gap-1.5 rounded-field border border-dashed border-line bg-surface p-5 lg:rounded-card lg:p-6">
            <span className="font-display text-[26px] font-semibold uppercase lg:text-[30px]">
              Nothing here yet
            </span>
            <span className="text-sm text-muted">
              Ask the store on WhatsApp; most products can be ordered in a day
              or two.
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={ContactHelper.whatsappHref(
                  `Hello, do you have anything in ${current?.name ?? "stock"}?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BUTTON_CLASSES.whatsapp} min-h-12 text-[22px]`}
              >
                <MessageCircle size={18} aria-hidden="true" />
                Ask on WhatsApp
              </a>
              {parent ? (
                <Link
                  to="/categories/$slug"
                  params={{ slug: parent.slug }}
                  className={`${BUTTON_CLASSES.secondary} min-h-12 text-[22px]`}
                >
                  See all {parent.name}
                </Link>
              ) : (
                current && (
                  <Link
                    to="/products"
                    className={`${BUTTON_CLASSES.secondary} min-h-12 text-[22px]`}
                  >
                    See all products
                  </Link>
                )
              )}
            </div>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] lg:gap-5">
            {products.items.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}

        <CatalogPager
          pagination={products.pagination}
          categorySlug={current?.slug ?? null}
        />
      </div>
    </div>
  );
}
