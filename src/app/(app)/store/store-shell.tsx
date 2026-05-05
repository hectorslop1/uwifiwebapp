"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  Gift,
  Plus,
  Router,
  Search,
  Sparkles,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import {
  storeCategories,
  type StoreCategory,
  type StoreProduct,
} from "@/src/lib/store-catalog";
import type { StoreCartSnapshot } from "@/src/lib/store-types";
import { cn } from "@/src/lib/cn";

import { addStoreCartItemAction } from "./actions";
import { StoreFlash } from "./store-ui";

type Category = "All" | StoreCategory;

function AddToCartButton({
  inCartQuantity,
}: Readonly<{
  inCartQuantity: number;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="theme-control inline-flex items-center justify-center gap-2 rounded-pill border border-[#cfe8cf] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,252,240,0.94))] px-4 py-2.5 text-body-sm font-medium text-[#2f9837] shadow-[0_12px_26px_rgba(177,215,172,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(248,255,247,1),rgba(233,249,231,0.96))] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Plus size={15} strokeWidth={1.8} />
      {pending
        ? "Adding..."
        : inCartQuantity > 0
          ? "Add another"
          : "Add to cart"}
    </button>
  );
}

function getStoreCategoryIcon(category: StoreCategory) {
  if (category === "Gift Cards") {
    return <Gift size={28} strokeWidth={1.7} />;
  }

  if (category === "Devices") {
    return <Router size={28} strokeWidth={1.7} />;
  }

  return <Sparkles size={28} strokeWidth={1.7} />;
}

export function StoreShell({
  products: allProducts,
  cart,
  flash,
}: Readonly<{
  products: StoreProduct[];
  cart: StoreCartSnapshot;
  flash: { status: "success" | "error"; message: string } | null;
}>) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesCategory =
        category === "All" ? true : product.category === category;
      const matchesQuery =
        normalized.length === 0
          ? true
          : `${product.name} ${product.description} ${product.category}`
              .toLowerCase()
              .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [allProducts, category, query]);

  return (
    <div className="space-y-3 pb-2 xl:[zoom:0.92] 2xl:[zoom:1]">
      <PageIntro
        eyebrow="Store"
        title="U-Store"
        description="Browse gift cards, devices, and add-ons available in your U-WiFi account."
        actions={
          <>
            <StatusPill label={`${products.length} items visible`} tone="brand" />
            <Link
              href="/store/checkout"
              className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2.5 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
            >
              Cart {cart.itemCount ? `(${cart.itemCount})` : ""}
            </Link>
          </>
        }
      />

      {flash ? <StoreFlash tone={flash.status}>{flash.message}</StoreFlash> : null}

      <SurfacePanel className="p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:items-center">
          <div className="theme-input rounded-[1.3rem] border border-white/80 bg-white/55 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-3 text-ink-muted">
              <Search size={18} strokeWidth={1.8} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          <SegmentedControl
            value={category}
            onChange={setCategory}
            options={storeCategories.map((value) => ({ value, label: value }))}
          />
        </div>
      </SurfacePanel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <SurfacePanel key={product.id} className="flex h-full flex-col p-3.5">
            <div className="theme-inline-surface rounded-[1.15rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,244,0.78))] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
              <div className="theme-panel-soft mx-auto flex h-28 items-center justify-center overflow-hidden rounded-[1.2rem] bg-white/90 shadow-[0_16px_34px_rgba(198,202,212,0.14)]">
                {product.imageSrc ? (
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    width={200}
                    height={120}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <span
                    className={cn(
                      "theme-icon-surface flex h-16 w-16 items-center justify-center rounded-[1.15rem]",
                      product.accent === "brand"
                        ? "bg-[linear-gradient(180deg,rgba(122,99,255,0.14),rgba(122,99,255,0.08))] text-[#6c45ff]"
                        : product.accent === "success"
                          ? "bg-[linear-gradient(180deg,rgba(89,195,79,0.16),rgba(89,195,79,0.08))] text-[#3ba745]"
                          : "bg-[linear-gradient(180deg,rgba(57,64,78,0.08),rgba(57,64,78,0.04))] text-ink-soft",
                    )}
                  >
                    {getStoreCategoryIcon(product.category)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[1rem] font-medium tracking-[-0.03em] text-ink">{product.name}</div>
                {cart.quantitiesByProductId[product.id] ? (
                  <StatusPill
                    label={`In cart (${cart.quantitiesByProductId[product.id]})`}
                    tone="success"
                  />
                ) : product.featured ? (
                  <StatusPill label="Featured" tone="brand" />
                ) : null}
              </div>
              <div className="mt-1 min-h-[2.6rem] text-[0.86rem] leading-5 text-ink-muted">
                {product.description}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.highlights.slice(0, 2).map((highlight) => (
                  <span
                    key={highlight}
                    className="theme-control-muted rounded-pill bg-white/65 px-2.5 py-1 text-[0.74rem] text-ink-muted"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-3">
                <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">{product.category}</div>
                  <div className="mt-1 text-[1.18rem] font-medium tracking-[-0.05em] text-ink">
                    {product.priceLabel}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <form action={addStoreCartItemAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="quantity" value="1" />
                    <input type="hidden" name="redirectTo" value="/store" />
                    <AddToCartButton
                      inCartQuantity={cart.quantitiesByProductId[product.id] ?? 0}
                    />
                  </form>

                  <Link
                    href={`/store/product/${product.id}`}
                    className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-3.5 py-2 text-[0.86rem] font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
                  >
                    View details
                    <ArrowRight size={16} strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
              </div>
            </div>
          </SurfacePanel>
        ))}
      </div>
    </div>
  );
}
