"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";

import type { StoreCartLineItem, StoreCartSnapshot } from "@/src/lib/store-types";
import { cn } from "@/src/lib/cn";

import {
  clearStoreCartAction,
  removeStoreCartItemAction,
  updateStoreCartQuantityAction,
} from "./actions";
import { formatStoreCurrency } from "./store-ui";

function CartLineEditor({
  item,
  redirectTo,
}: Readonly<{
  item: StoreCartLineItem;
  redirectTo: string;
}>) {
  return (
    <div className="theme-inline-surface w-full rounded-[1.2rem] border border-white/80 bg-white/78 p-3.5 shadow-[0_14px_26px_rgba(199,203,212,0.08)]">
      <div className="flex gap-3">
        <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.88))] p-2">
          {item.product.imageSrc ? (
            <Image
              src={item.product.imageSrc}
              alt={item.product.name}
              width={90}
              height={90}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-success">
              <ShoppingCart size={22} strokeWidth={1.8} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[0.95rem] font-medium tracking-[-0.03em] text-ink">
                {item.product.name}
              </div>
              <div className="mt-1 text-[0.8rem] text-ink-muted">
                {item.variant?.name || item.product.category}
              </div>
            </div>
            <div className="text-[0.92rem] font-medium text-ink">
              {formatStoreCurrency(item.total)}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/72 px-2 py-1">
              <form action={updateStoreCartQuantityAction}>
                <input type="hidden" name="lineId" value={item.id} />
                <input type="hidden" name="delta" value="-1" />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button
                  type="submit"
                  className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  <Minus size={14} strokeWidth={1.8} />
                </button>
              </form>

              <span className="min-w-6 text-center text-[0.86rem] font-medium text-ink">
                {item.quantity}
              </span>

              <form action={updateStoreCartQuantityAction}>
                <input type="hidden" name="lineId" value={item.id} />
                <input type="hidden" name="delta" value="1" />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button
                  type="submit"
                  className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  <Plus size={14} strokeWidth={1.8} />
                </button>
              </form>
            </div>

            <form action={removeStoreCartItemAction}>
              <input type="hidden" name="lineId" value={item.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="theme-secondary-action inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-[0.78rem] font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                Remove
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreCartDrawer({
  cart,
  open,
  redirectTo = "/store",
  onClose,
}: Readonly<{
  cart: StoreCartSnapshot;
  open: boolean;
  redirectTo?: string;
  onClose: () => void;
}>) {
  const hasItems = cart.items.length > 0;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart drawer"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(8,12,16,0.16)] backdrop-blur-sm transition-all duration-200",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "theme-panel fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[27rem] flex-col border-l border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,248,246,0.94))] px-4 py-4 shadow-[0_28px_72px_rgba(166,173,184,0.22)] transition-transform duration-300 ease-out sm:px-5",
          open ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line/20 pb-3">
          <div>
            <div className="text-[1.15rem] font-medium tracking-[-0.04em] text-ink">
              Your cart
            </div>
            <div className="mt-1 text-[0.86rem] text-ink-muted">
              Review quantities, variants and totals before checkout.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-control-button flex h-10 w-10 items-center justify-center rounded-full border text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
          >
            <X size={17} strokeWidth={1.9} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          {hasItems ? (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartLineEditor key={item.id} item={item} redirectTo={redirectTo} />
              ))}
            </div>
          ) : (
            <div className="theme-inline-surface mt-2 rounded-[1.25rem] border border-white/80 px-4 py-5 text-[0.9rem] text-ink-muted">
              Your cart is empty. Add something from the store to start a checkout flow.
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-line/20 pt-4">
          <div className="theme-soft-well rounded-[1.2rem] border border-line/20 px-4 py-3.5">
            <div className="flex items-center justify-between text-[0.84rem] text-ink-muted">
              <span>Subtotal</span>
              <span className="text-[1.1rem] font-medium tracking-[-0.04em] text-ink">
                {formatStoreCurrency(cart.subtotal)}
              </span>
            </div>
            <div className="mt-2 text-[0.78rem] text-ink-faint">
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} ready for review.
            </div>
          </div>

          {hasItems ? (
            <Link
              href="/store/checkout"
              onClick={onClose}
              className="theme-primary-action inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <ShoppingCart size={16} strokeWidth={1.8} />
              Continue to Checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="theme-primary-action inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium opacity-60"
            >
              <ShoppingCart size={16} strokeWidth={1.8} />
              Continue to Checkout
            </button>
          )}

          <form action={clearStoreCartAction}>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="theme-secondary-action inline-flex min-h-[3rem] w-full items-center justify-center rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Clear cart
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
