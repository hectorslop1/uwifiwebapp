"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  Gift,
  Minus,
  Phone,
  Plus,
  Router,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Tv,
} from "lucide-react";

import { InteractiveHoverButtonLink } from "@/src/components/magic/interactive-hover-button";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { KeyValueList } from "@/src/components/ui/key-value-list";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { StoreProduct } from "@/src/lib/store-catalog";
import { cn } from "@/src/lib/cn";

import { addStoreCartItemAction } from "../actions";
import { formatStoreCurrency, StoreFlash } from "../store-ui";

function AddDetailToCartButton({
  quantity,
}: Readonly<{
  quantity: number;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="theme-cta mt-5 block w-full rounded-pill bg-[linear-gradient(180deg,rgba(98,201,89,0.95),rgba(72,177,69,0.98))] px-4 py-3 text-center text-body-sm font-medium text-white shadow-[0_18px_32px_rgba(95,185,89,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(95,185,89,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Adding..." : `Add ${quantity} to cart`}
    </button>
  );
}

function getStoreCategoryIcon(product: StoreProduct) {
  switch (product.category) {
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

export function ProductDetailShell({
  product,
  cartItemCount,
  cartQuantity,
  flash,
}: Readonly<{
  product: StoreProduct;
  cartItemCount: number;
  cartQuantity: number;
  flash: { status: "success" | "error"; message: string } | null;
}>) {
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(() => product.price * quantity, [product.price, quantity]);

  return (
    <div className="space-y-3 pb-2 xl:[zoom:0.92] 2xl:[zoom:1]">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-body-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Back to store
      </Link>

      {flash ? <StoreFlash tone={flash.status}>{flash.message}</StoreFlash> : null}

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1.1fr)_20rem]">
        <SurfacePanel className="p-4 sm:p-4 lg:min-h-0">
          <PageIntro
            eyebrow={product.category}
            title={product.name}
            description={product.description}
            actions={
              <>
                <StatusPill label={product.priceLabel} tone="success" />
                <Link
                  href="/store/checkout"
                  className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2.5 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
                >
                  <ShoppingCart size={15} strokeWidth={1.8} />
                  Cart {cartItemCount ? `(${cartItemCount})` : ""}
                </Link>
              </>
            }
          />

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <div className="theme-inline-surface rounded-[1.45rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,246,249,0.72))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
              <div className="mx-auto flex h-[13rem] w-full max-w-[14rem] items-center justify-center overflow-hidden rounded-[1.4rem]">
                {product.imageSrc ? (
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    width={280}
                    height={220}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-[10rem] w-[10rem] items-center justify-center rounded-[2rem]",
                      product.accent === "brand"
                        ? "bg-[linear-gradient(180deg,rgba(122,99,255,0.14),rgba(122,99,255,0.08))] text-[#6c45ff]"
                        : product.accent === "success"
                          ? "bg-[linear-gradient(180deg,rgba(89,195,79,0.16),rgba(89,195,79,0.08))] text-[#3ba745]"
                          : "bg-[linear-gradient(180deg,rgba(57,64,78,0.08),rgba(57,64,78,0.04))] text-ink-soft",
                    )}
                  >
                    {getStoreCategoryIcon(product)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <SurfacePanel subtle className="p-4">
                <div className="text-title-md text-ink">Why it exists</div>
                <div className="mt-3 text-body-sm text-ink-muted">
                  {product.description}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.highlights.slice(0, 3).map((highlight) => (
                    <span
                      key={highlight}
                      className="theme-control-muted rounded-pill bg-white/65 px-3 py-1.5 text-label-md text-ink-muted"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </SurfacePanel>

              <SurfacePanel subtle className="p-4">
                <div className="text-title-md text-ink">Specification summary</div>
                <div className="mt-4">
                  <KeyValueList
                    items={[
                      { label: "Category", value: product.category },
                      { label: "Model", value: product.model },
                      { label: "Price", value: product.priceLabel },
                      { label: "Billing", value: product.period ?? "one-time" },
                    ]}
                  />
                </div>
              </SurfacePanel>
            </div>
          </div>
        </SurfacePanel>

        <div className="space-y-3">
          <SurfacePanel subtle className="p-4">
            <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
              Order summary
            </div>
              <div className="mt-3 text-[2.25rem] font-medium tracking-[-0.06em] text-ink">
              {formatStoreCurrency(total)}
              </div>
            <div className="mt-1 text-body-sm text-ink-muted">{product.priceLabel}</div>
            {cartQuantity > 0 ? (
              <div className="mt-2 text-body-sm text-[#43ae46]">
                Already in cart: {cartQuantity}
              </div>
            ) : null}

            <div className="theme-control mt-5 flex items-center justify-between rounded-pill border border-white/80 bg-white/60 px-3 py-2.5">
              <span className="text-body-sm text-ink-muted">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  <Minus size={15} strokeWidth={1.8} />
                </button>
                <span className="w-8 text-center text-body-sm text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  <Plus size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <form action={addStoreCartItemAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value={String(quantity)} />
              <input type="hidden" name="redirectTo" value={`/store/${product.id}`} />
              <AddDetailToCartButton quantity={quantity} />
            </form>

            <InteractiveHoverButtonLink
              href="/store/checkout"
              className="theme-control mt-3 block rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-3 text-center text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)]"
              containerClassName="mt-3 rounded-pill"
            >
              Continue to checkout
            </InteractiveHoverButtonLink>

            <div className="theme-soft-well mt-4 flex items-start gap-3 rounded-[1.15rem] bg-white/50 px-4 py-4 text-body-sm text-ink-muted">
              <ShieldCheck size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-success" />
              Review your quantity here, then move straight into payment and points selection.
            </div>
          </SurfacePanel>

                  </div>
      </div>
    </div>
  );
}
