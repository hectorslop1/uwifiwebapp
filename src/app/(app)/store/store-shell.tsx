"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  BadgePlus,
  ExternalLink,
  Gift,
  Headset,
  Phone,
  Plus,
  Router,
  Search,
  ShoppingBag,
  Sparkles,
  Tv,
  UsersRound,
  Zap,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { FeedbackState } from "@/src/components/ui/feedback-state";
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
  switch (category) {
    case "Merchandise":
      return <ShoppingBag size={28} strokeWidth={1.7} />;
    case "IPTV":
      return <Tv size={28} strokeWidth={1.7} />;
    case "Phone":
      return <Phone size={28} strokeWidth={1.7} />;
    case "Add-ons":
      return <Sparkles size={28} strokeWidth={1.7} />;
    default:
      return <Sparkles size={28} strokeWidth={1.7} />;
  }
}

function getAddOnIcon(productId: string) {
  if (productId === "premium-support") {
    return <Headset size={22} strokeWidth={1.8} />;
  }

  if (productId === "data-boost") {
    return <Zap size={22} strokeWidth={1.8} />;
  }

  return <UsersRound size={22} strokeWidth={1.8} />;
}

function StoreProductCard({
  product,
  cartQuantity,
}: Readonly<{
  product: StoreProduct;
  cartQuantity: number;
}>) {
  const [selectedVariant, setSelectedVariant] = useState(product.selectedVariant || product.variants?.[0]?.id || '');

  const currentVariant = product.variants?.find(v => v.id === selectedVariant) || product.variants?.[0];
  const displayImage = currentVariant?.imageSrc || product.imageSrc;

  return (
    <SurfacePanel className="flex h-full flex-col p-3.5">
      <div className="theme-inline-surface rounded-[1.15rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,244,0.78))] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
        <div className="theme-panel-soft mx-auto flex h-36 w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-white/90 p-3 shadow-[0_16px_34px_rgba(198,202,212,0.14)]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              width={140}
              height={140}
              className="h-full w-full object-cover"
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

      {product.variants && product.variants.length > 1 && (
        <div className="mt-3">
          <div className="text-body-sm font-medium text-ink mb-2">Select variant:</div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={cn(
                  "theme-control-muted rounded-pill border px-3 py-1.5 text-[0.74rem] transition-all duration-200",
                  selectedVariant === variant.id
                    ? "border-success bg-success/10 text-success"
                    : "border-[#dfe9de] bg-white hover:bg-[#f8faf8]"
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[1rem] font-medium tracking-[-0.03em] text-ink">
            {product.name}
          </div>
          {cartQuantity ? (
            <StatusPill label={`In cart (${cartQuantity})`} tone="success" />
          ) : product.featured ? (
            <StatusPill label="Featured" tone="brand" />
          ) : null}
        </div>
        <div className="mt-1 min-h-[2.6rem] text-[0.86rem] leading-5 text-ink-muted">
          {product.description}
        </div>
        <div className="mt-2 min-h-[2.25rem] flex flex-wrap gap-2">
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
              <div className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">
                {product.category}
              </div>
              <div className="mt-1 text-[1.18rem] font-medium tracking-[-0.05em] text-ink">
                {product.priceLabel}
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <form action={addStoreCartItemAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <input type="hidden" name="redirectTo" value="/store" />
              <AddToCartButton inCartQuantity={cartQuantity} />
            </form>

            <Link
              href={`/store/${product.id}`}
              className="theme-secondary-action inline-flex items-center justify-center gap-2 rounded-pill border px-3.5 py-2 text-[0.86rem] font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              View details
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </SurfacePanel>
  );
}

function ExternalServiceRow({
  product,
}: Readonly<{
  product: StoreProduct;
}>) {
  const getServiceUrl = (productId: string) => {
    switch (productId) {
      case "hdtv-antenna":
        return "https://www.amazon.com/GE-Extendable-Adjustable-Compatible-33681/dp/B01IAN1C28";
      case "directv":
        return "https://www.directv.com";
      case "hulu":
        return "https://www.hulu.com";
      case "t-mobile":
        return "https://www.t-mobile.com";
      default:
        return "#";
    }
  };

  return (
    <SurfacePanel className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <span className="theme-icon-surface flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,rgba(244,240,255,0.98),rgba(238,235,252,0.94))] text-brand">
            {product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.name}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            ) : (
              getStoreCategoryIcon(product.category)
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[1rem] font-medium tracking-[-0.03em] text-ink">
                {product.name}
              </div>
              <StatusPill label="External" tone="muted" />
            </div>
            <div className="mt-1 text-[0.88rem] leading-5 text-ink-muted">
              {product.description}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.highlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="theme-control-muted rounded-pill bg-white/65 px-2.5 py-1 text-[0.74rem] text-ink-muted"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:ml-auto lg:w-[13rem]">
          <div className="text-right text-[1.08rem] font-medium tracking-[-0.04em] text-ink">
            {product.priceLabel}
          </div>
          <div className="mt-3 grid gap-2">
            <a
              href={getServiceUrl(product.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-primary-action inline-flex items-center justify-center gap-2 rounded-pill border px-3.5 py-2 text-[0.86rem] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <ExternalLink size={16} strokeWidth={1.8} />
              Visit service
            </a>
            <Link
              href={`/store/${product.id}`}
              className="theme-secondary-action inline-flex items-center justify-center gap-2 rounded-pill border px-3.5 py-2 text-[0.86rem] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              View details
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </SurfacePanel>
  );
}

function AddOnRow({
  product,
  cartQuantity,
}: Readonly<{
  product: StoreProduct;
  cartQuantity: number;
}>) {
  return (
    <SurfacePanel className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <span className="theme-icon-surface flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,rgba(244,240,255,0.98),rgba(238,235,252,0.94))] text-brand">
            {getAddOnIcon(product.id)}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[1rem] font-medium tracking-[-0.03em] text-ink">
                {product.name}
              </div>
              {cartQuantity ? (
                <StatusPill label={`In cart (${cartQuantity})`} tone="success" />
              ) : null}
            </div>
            <div className="mt-1 text-[0.88rem] leading-5 text-ink-muted">
              {product.description}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.highlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="theme-control-muted rounded-pill bg-white/65 px-2.5 py-1 text-[0.74rem] text-ink-muted"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:ml-auto lg:w-[13rem]">
          <div className="text-right text-[1.08rem] font-medium tracking-[-0.04em] text-ink">
            {product.priceLabel}
          </div>
          <div className="mt-3 grid gap-2">
            <form action={addStoreCartItemAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <input type="hidden" name="redirectTo" value="/store" />
              <AddToCartButton inCartQuantity={cartQuantity} />
            </form>
            <Link
              href={`/store/${product.id}`}
              className="theme-secondary-action inline-flex items-center justify-center gap-2 rounded-pill border px-3.5 py-2 text-[0.86rem] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              View details
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </SurfacePanel>
  );
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
  const [category, setCategory] = useState<StoreCategory>(storeCategories[0]);
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesCategory = product.category === category;
      const matchesQuery =
        normalized.length === 0
          ? true
          : `${product.name} ${product.description} ${product.category}`
              .toLowerCase()
              .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [allProducts, category, query]);

  const selectedCategoryIcon = useMemo(() => {
    switch (category) {
      case "Merchandise":
        return <ShoppingBag size={18} strokeWidth={1.8} />;
      case "IPTV":
        return <Tv size={18} strokeWidth={1.8} />;
      case "Phone":
        return <Phone size={18} strokeWidth={1.8} />;
      case "Add-ons":
        return <BadgePlus size={18} strokeWidth={1.8} />;
      default:
        return <BadgePlus size={18} strokeWidth={1.8} />;
    }
  }, [category]);

  return (
    <div className="space-y-3 pb-2 xl:[zoom:0.92] 2xl:[zoom:1]">
      <PageIntro
        eyebrow="Store"
        title="U-Store"
        description="Browse complete U-WiFi store lineup of merchandise, IPTV, phone services, and account add-ons."
        actions={
          <div className="theme-tab-shell flex flex-wrap items-center gap-2 rounded-[1.2rem] border p-2">
            <StatusPill label={`${products.length} items visible`} tone="brand" />
            <Link
              href="/store/checkout"
              className="theme-secondary-action inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Cart {cart.itemCount ? `(${cart.itemCount})` : ""}
            </Link>
          </div>
        }
      />

      {flash ? <StoreFlash tone={flash.status}>{flash.message}</StoreFlash> : null}

      <SurfacePanel className="p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto] xl:items-center">
          <div className="theme-input-shell rounded-[1.3rem] border px-4 py-3">
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

          <div className="theme-inline-surface inline-flex items-center gap-2 rounded-[1.1rem] border border-white/75 bg-white/70 px-3.5 py-2.5 text-body-sm text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
            <span className="text-success">{selectedCategoryIcon}</span>
            {category}
          </div>
        </div>
      </SurfacePanel>


      {products.length ? (
        <>
          {category === "Merchandise" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">Available Products</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    U-Wifi branded merchandise and accessories.
                  </div>
                </div>
                <StatusPill label={`${products.length} products`} tone="brand" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cart.quantitiesByProductId[product.id] ?? 0}
                  />
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          {category === "IPTV" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">IPTV Options</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    TV and streaming services available through U-Store partners.
                  </div>
                </div>
                <StatusPill label={`${products.length} services`} tone="brand" />
              </div>

              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <ExternalServiceRow
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          {category === "Phone" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">Phone Services</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Mobile phone plans and devices from U-Store partners.
                  </div>
                </div>
                <StatusPill label={`${products.length} services`} tone="brand" />
              </div>

              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <ExternalServiceRow
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          {category === "Add-ons" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">Available add-ons</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Account upgrades and support options reflected in the mobile U-Store.
                  </div>
                </div>
                <StatusPill label={`${products.length} add-ons`} tone="brand" />
              </div>

              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <AddOnRow
                    key={product.id}
                    product={product}
                    cartQuantity={cart.quantitiesByProductId[product.id] ?? 0}
                  />
                ))}
              </div>
            </SurfacePanel>
          ) : null}
        </>
      ) : (
        <FeedbackState
          title="No products match this search"
          description={`Try another search term inside ${category.toLowerCase()}.`}
          icon={<Search size={20} strokeWidth={1.8} />}
        />
      )}
    </div>
  );
}
