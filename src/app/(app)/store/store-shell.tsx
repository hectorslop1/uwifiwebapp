"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Antenna,
  ArrowRight,
  BadgePlus,
  BatteryCharging,
  ExternalLink,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tv,
  UsersRound,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { FeedbackState } from "@/src/components/ui/feedback-state";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import {
  getStoreVariantColors,
  getStoreProductVariant,
  storeCategories,
  type StoreCategory,
  type StoreProduct,
} from "@/src/lib/store-catalog";
import type { StoreCartSnapshot } from "@/src/lib/store-types";
import { cn } from "@/src/lib/cn";

import {
  addStoreCartItemAction,
} from "./actions";
import { StoreFlash } from "./store-ui";
import { StoreCartDrawer } from "./store-cart-drawer";

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
      className="theme-primary-action inline-flex min-h-[2.9rem] items-center justify-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
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

function StoreProductImage({
  imageSrc,
  alt,
  imageRef,
}: Readonly<{
  imageSrc?: string;
  alt: string;
  imageRef?: React.RefObject<HTMLDivElement | null>;
}>) {
  return (
    <div className="relative overflow-hidden rounded-[1.55rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(124,225,128,0.18),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,247,244,0.86))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
      <div className="absolute inset-x-6 top-0 h-16 rounded-b-[1.4rem] bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.12),transparent_72%)]" />
      <div
        ref={imageRef}
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.3rem] bg-white/92 px-4 py-5 shadow-[0_18px_36px_rgba(194,199,208,0.12)]"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            width={340}
            height={260}
            className="h-full w-full rounded-[1.25rem] object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(244,240,255,0.98),rgba(238,235,252,0.94))] text-brand">
            <ShoppingBag size={28} strokeWidth={1.7} />
          </div>
        )}
      </div>
    </div>
  );
}

function getStoreCategoryIcon(category: StoreCategory) {
  switch (category) {
    case "Merchandise":
      return <ShoppingBag size={18} strokeWidth={1.8} />;
    case "IPTV":
      return <Tv size={18} strokeWidth={1.8} />;
    case "Phone":
      return <Phone size={18} strokeWidth={1.8} />;
    case "Add Ons":
      return <BadgePlus size={18} strokeWidth={1.8} />;
    default:
      return <Sparkles size={18} strokeWidth={1.8} />;
  }
}

function getAddOnIcon(productId: string) {
  switch (productId) {
    case "external-attena":
      return <Antenna size={22} strokeWidth={1.8} />;
    case "battery-backup":
      return <BatteryCharging size={22} strokeWidth={1.8} />;
    default:
      return <UsersRound size={22} strokeWidth={1.8} />;
  }
}

function StoreProductCard({
  product,
  cartQuantity,
}: Readonly<{
  product: StoreProduct;
  cartQuantity: number;
}>) {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(
    product.selectedVariant || product.variants?.[0]?.id || "",
  );
  const currentVariant = getStoreProductVariant(product, selectedVariant);
  const colorOptions = useMemo(() => getStoreVariantColors(product), [product]);
  const displayImage = currentVariant?.imageSrc || product.imageSrc;

  const handleVariantChange = (color: string) => {
    const matchingVariant =
      product.variants?.find((variant) => variant.color === color) ??
      product.variants?.[0];

    if (matchingVariant) {
      setSelectedVariant(matchingVariant.id);
    }
  };

  const handleAnimatedSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;

    if (form.dataset.animated === "1") {
      form.dataset.animated = "0";
      return;
    }

    const source = imageRef.current;
    const target = document.getElementById("store-cart-trigger");

    if (!source || !target) {
      return;
    }

    event.preventDefault();
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const ghost = document.createElement("div");

    ghost.style.position = "fixed";
    ghost.style.left = `${sourceRect.left + sourceRect.width / 2 - 22}px`;
    ghost.style.top = `${sourceRect.top + sourceRect.height / 2 - 22}px`;
    ghost.style.width = "44px";
    ghost.style.height = "44px";
    ghost.style.borderRadius = "9999px";
    ghost.style.background = "linear-gradient(180deg, rgba(69,211,81,0.98), rgba(42,184,59,0.98))";
    ghost.style.boxShadow = "0 18px 34px rgba(80,190,88,0.28)";
    ghost.style.zIndex = "9999";
    ghost.style.pointerEvents = "none";
    ghost.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease-out";
    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${targetRect.left - sourceRect.left + 12}px, ${targetRect.top - sourceRect.top - 18}px) scale(0.32)`;
      ghost.style.opacity = "0.16";
    });

    window.setTimeout(() => {
      ghost.remove();
      form.dataset.animated = "1";
      form.requestSubmit();
    }, 260);
  };

  return (
    <SurfacePanel className="group flex h-full flex-col p-4 transition-transform duration-200 hover:-translate-y-1">
      <StoreProductImage imageSrc={displayImage} alt={product.name} imageRef={imageRef} />

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[1.08rem] font-medium tracking-[-0.04em] text-ink">
              {product.name}
            </div>
            <div className="mt-1 text-[0.86rem] leading-5 text-ink-muted">
              {product.description}
            </div>
          </div>

          {cartQuantity ? (
            <StatusPill label={`In cart (${cartQuantity})`} tone="success" />
          ) : product.featured ? (
            <StatusPill label="Featured" tone="brand" />
          ) : null}
        </div>

        {colorOptions.length ? (
          <div className="mt-4">
            <div className="mb-2 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Select variant
            </div>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => {
                const active = currentVariant?.color === option.color || currentVariant?.name === option.color;

                return (
                  <button
                    key={option.color}
                    type="button"
                    onClick={() => handleVariantChange(option.color)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-[0.76rem] font-medium transition-all duration-200",
                      active
                        ? "theme-control-button-active border border-transparent text-ink"
                        : "theme-secondary-action border border-transparent text-ink-soft hover:text-ink",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-black/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                      style={{ backgroundColor: option.colorHex }}
                    />
                    {option.color}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {product.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-pill bg-[rgba(255,255,255,0.7)] px-2.5 py-1 text-[0.74rem] text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                {product.category}
              </div>
              <div className="mt-1 text-[1.28rem] font-medium tracking-[-0.05em] text-ink">
                {product.priceLabel}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <form action={addStoreCartItemAction} onSubmitCapture={handleAnimatedSubmit}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="variantId" value={currentVariant?.id ?? ""} />
              <input type="hidden" name="quantity" value="1" />
              <input type="hidden" name="redirectTo" value="/store" />
              <AddToCartButton inCartQuantity={cartQuantity} />
            </form>

            <Link
              href={`/store/${product.id}`}
              className="theme-secondary-action inline-flex min-h-[2.9rem] items-center justify-center gap-2 rounded-pill border px-4 py-2.5 text-[0.86rem] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
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
      case "ooma":
        return "https://www.ooma.com";
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
                  className="rounded-pill bg-white/65 px-2.5 py-1 text-[0.74rem] text-ink-muted"
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
                  className="rounded-pill bg-white/65 px-2.5 py-1 text-[0.74rem] text-ink-muted"
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
  const [cartOpen, setCartOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const products = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesCategory = product.category === category;
      const variantSearch = product.variants?.map((variant) => variant.name).join(" ") || "";
      const matchesQuery =
        normalized.length === 0
          ? true
          : `${product.name} ${product.description} ${product.category} ${product.subCategory ?? ""} ${variantSearch}`
              .toLowerCase()
              .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [allProducts, category, deferredQuery]);

  return (
    <div className="space-y-4 pb-4">
      <PageIntro
        eyebrow="Store"
        title="U-Store"
        description="Browse curated merchandise, partner services and account add-ons with a cleaner shopping flow."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={`${products.length} items visible`} tone="brand" />
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              id="store-cart-trigger"
              className="theme-primary-action inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <ShoppingCart size={16} strokeWidth={1.8} />
              Cart
              {cart.itemCount ? (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.76rem] text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {cart.itemCount}
                </span>
              ) : null}
            </button>
          </div>
        }
      />

      {flash ? <StoreFlash tone={flash.status}>{flash.message}</StoreFlash> : null}

      <SurfacePanel className="overflow-hidden p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_72%)]" />

        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto] xl:items-center">
          <div className="theme-input-shell rounded-[1.35rem] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="flex items-center gap-3 text-ink-muted">
              <Search size={18} strokeWidth={1.8} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, services or variants..."
                className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          <SegmentedControl
            value={category}
            onChange={setCategory}
            options={storeCategories.map((value) => ({ value, label: value }))}
          />

          <div className="theme-inline-surface inline-flex items-center gap-2 rounded-[1.15rem] border border-white/75 bg-white/72 px-3.5 py-2.5 text-body-sm text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
            <span className="text-success">{getStoreCategoryIcon(category)}</span>
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
                  <div className="text-title-md text-ink">Premium merchandise</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Cleaner cards, consistent imagery and direct variant selection.
                  </div>
                </div>
                <StatusPill label={`${products.length} products`} tone="brand" />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <div className="text-title-md text-ink">IPTV options</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Partner services presented with clearer actions and stronger hierarchy.
                  </div>
                </div>
                <StatusPill label={`${products.length} services`} tone="brand" />
              </div>

              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <ExternalServiceRow key={product.id} product={product} />
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          {category === "Phone" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">Phone services</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Home and mobile phone partners with a tighter, more polished browsing flow.
                  </div>
                </div>
                <StatusPill label={`${products.length} services`} tone="brand" />
              </div>

              <div className="mt-4 space-y-5">
                {(["Home Phone", "Mobile phone"] as const).map((segment) => {
                  const segmentProducts = products.filter(
                    (product) => product.subCategory === segment,
                  );

                  return (
                    <div key={segment} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[0.92rem] font-medium tracking-[-0.03em] text-ink">
                          {segment}
                        </div>
                        <div className="text-[0.82rem] text-ink-muted">
                          {segmentProducts.length ? `${segmentProducts.length} option(s)` : "No options"}
                        </div>
                      </div>

                      {segmentProducts.length ? (
                        segmentProducts.map((product) => (
                          <ExternalServiceRow key={product.id} product={product} />
                        ))
                      ) : (
                        <div className="rounded-[1rem] border border-white/60 bg-white/60 px-4 py-3 text-[0.86rem] text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                          No services available right now.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SurfacePanel>
          ) : null}

          {category === "Add Ons" ? (
            <SurfacePanel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-title-md text-ink">Gateway add-ons</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Hardware options and upgrades designed for your gateway setup.
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

      <StoreCartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
