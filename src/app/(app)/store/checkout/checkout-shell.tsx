"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  CreditCard,
  Gift,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { StoreCartSnapshot } from "@/src/lib/store-types";
import { getHighestUnlockedMilestone, getNextMilestone } from "@/src/lib/wallet-milestones";
import type { PaymentMethod } from "@/src/server/billing/types";
import type { WalletPointsSummary } from "@/src/server/wallet/types";

import {
  clearStoreCartAction,
  completeStoreCheckoutAction,
  removeStoreCartItemAction,
  updateStoreCartQuantityAction,
} from "../actions";
import { formatStoreCurrency, StoreFlash } from "../store-ui";

type CheckoutStep = "payment" | "review";

function CartMutationButton({
  children,
  disabled = false,
  className,
}: Readonly<{
  children: ReactNode;
  disabled?: boolean;
  className: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
    >
      {children}
    </button>
  );
}

function CheckoutSubmitButton({
  step,
  canComplete,
  onAdvance,
}: Readonly<{
  step: CheckoutStep;
  canComplete: boolean;
  onAdvance: () => void;
}>) {
  const { pending } = useFormStatus();

  if (step === "payment") {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="theme-cta mt-5 w-full rounded-pill bg-[linear-gradient(180deg,rgba(98,201,89,0.95),rgba(72,177,69,0.98))] px-4 py-3 text-body-sm font-medium text-white shadow-[0_18px_32px_rgba(95,185,89,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(95,185,89,0.28)]"
      >
        Review order
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={!canComplete || pending}
      className="theme-cta mt-5 w-full rounded-pill bg-[linear-gradient(180deg,rgba(98,201,89,0.95),rgba(72,177,69,0.98))] px-4 py-3 text-body-sm font-medium text-white shadow-[0_18px_32px_rgba(95,185,89,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(95,185,89,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Placing order..." : "Place order"}
    </button>
  );
}

function formatCardLabel(card: PaymentMethod) {
  if (!card.last4Digits) {
    return card.cardBrand || "Card";
  }

  return `${card.cardBrand || "Card"} ending in ${card.last4Digits}`;
}

export function CheckoutShell({
  cart,
  paymentMethods,
  walletPoints,
  flash,
  loadError,
}: Readonly<{
  cart: StoreCartSnapshot;
  paymentMethods: PaymentMethod[];
  walletPoints: WalletPointsSummary | null;
  flash: { status: "success" | "error"; message: string } | null;
  loadError: string | null;
}>) {
  const [step, setStep] = useState<CheckoutStep>("payment");
  const [selectedCardId, setSelectedCardId] = useState(
    paymentMethods.find((card) => card.isDefault)?.id ?? paymentMethods[0]?.id ?? 0,
  );
  const [usePoints, setUsePoints] = useState(false);

  const subtotal = cart.subtotal;
  const availablePointsValue = walletPoints?.totalDollars ?? 0;
  const availablePointsCount = walletPoints?.totalPoints ?? 0;
  const unlockedMilestone = getHighestUnlockedMilestone(availablePointsValue);
  const nextMilestone = getNextMilestone(availablePointsValue);
  const remainingToNext = nextMilestone ? Math.max(0, nextMilestone - availablePointsValue) : 0;
  const canRedeemPoints = unlockedMilestone >= 10;
  const applicablePointsValue = canRedeemPoints ? Math.min(unlockedMilestone, subtotal) : 0;
  const pointsDiscount = usePoints ? applicablePointsValue : 0;
  const total = Math.max(0, subtotal - pointsDiscount);
  const canComplete = cart.itemCount > 0 && (total === 0 || selectedCardId > 0);

  return (
    <div className="space-y-3 pb-2">
      <PageIntro
        eyebrow="Store"
        title="Checkout"
        description="Review your items, choose how to pay, and apply any U-Wallet credit before placing the order."
        actions={
          cart.itemCount ? (
            <SegmentedControl
              value={step}
              onChange={setStep}
              options={[
                { value: "payment", label: "1. Payment" },
                { value: "review", label: "2. Review" },
              ]}
            />
          ) : null
        }
      />

      {flash ? <StoreFlash tone={flash.status}>{flash.message}</StoreFlash> : null}
      {loadError ? <StoreFlash tone="error">{loadError}</StoreFlash> : null}

      {cart.isEmpty ? (
        <SurfacePanel className="p-5 sm:p-6">
          <div className="flex flex-col items-start gap-4">
            <span className="theme-icon-surface flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/85 text-ink-soft">
              <ShoppingBag size={20} strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-title-md text-ink">Your cart is empty</div>
              <div className="mt-2 max-w-[32rem] text-body-sm text-ink-muted">
                Add products from the store before moving into checkout.
              </div>
            </div>
            <Link
              href="/store"
              className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2.5 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
            >
              Browse products
            </Link>
          </div>
        </SurfacePanel>
      ) : null}

      {!cart.isEmpty ? (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
        <div className="space-y-3">
          <SurfacePanel className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-title-md text-ink">Selected items</div>
              <form action={clearStoreCartAction}>
                <input type="hidden" name="redirectTo" value="/store/checkout" />
                <CartMutationButton className="theme-control rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2 text-body-sm font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]">
                  Clear cart
                </CartMutationButton>
              </form>
            </div>

            <div className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="theme-inline-surface flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/75 bg-white/55 px-4 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-body-md font-medium text-ink">
                      {item.product.name}
                    </div>
                    <div className="mt-1 text-body-sm text-ink-muted">
                      {item.variant?.name || item.product.category}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <form action={updateStoreCartQuantityAction}>
                        <input type="hidden" name="lineId" value={item.id} />
                        <input type="hidden" name="delta" value="-1" />
                        <input type="hidden" name="redirectTo" value="/store/checkout" />
                        <CartMutationButton
                          disabled={item.quantity <= 1}
                          className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft disabled:opacity-50"
                        >
                          <Minus size={15} strokeWidth={1.8} />
                        </CartMutationButton>
                      </form>

                      <span className="min-w-8 text-center text-body-sm text-ink">
                        {item.quantity}
                      </span>

                      <form action={updateStoreCartQuantityAction}>
                        <input type="hidden" name="lineId" value={item.id} />
                        <input type="hidden" name="delta" value="1" />
                        <input type="hidden" name="redirectTo" value="/store/checkout" />
                        <CartMutationButton className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft">
                          <Plus size={15} strokeWidth={1.8} />
                        </CartMutationButton>
                      </form>

                      <form action={removeStoreCartItemAction}>
                        <input type="hidden" name="lineId" value={item.id} />
                        <input type="hidden" name="redirectTo" value="/store/checkout" />
                        <CartMutationButton className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-3 py-1.5 text-body-sm font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]">
                          <Trash2 size={14} strokeWidth={1.8} />
                          Remove
                        </CartMutationButton>
                      </form>
                    </div>
                  </div>

                  <div className="text-body-md font-medium text-ink">
                    {formatStoreCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </SurfacePanel>

          <SurfacePanel className="p-4 sm:p-4">
            <div className="text-title-md text-ink">Payment method</div>
            <div className="mt-4 space-y-3">
              {paymentMethods.length ? (
                paymentMethods.map((card) => {
                  const selected = card.id === selectedCardId;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCardId(card.id)}
                      className={`flex w-full items-center justify-between gap-4 rounded-[1.25rem] border px-4 py-4 text-left transition-all duration-200 ${
                        selected
                          ? "theme-control-active border-white/85 bg-white/78 shadow-[0_12px_30px_rgba(201,204,214,0.12)]"
                          : "theme-inline-surface border-white/70 bg-white/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="theme-icon-surface flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-white/90 text-ink-soft">
                          <CreditCard size={18} strokeWidth={1.8} />
                        </span>
                        <div>
                          <div className="text-body-md font-medium text-ink">
                            {formatCardLabel(card)}
                          </div>
                          <div className="text-body-sm text-ink-muted">
                            Expires {card.expirationMonth || "--"}/{card.expirationYear || "--"}
                          </div>
                        </div>
                      </div>

                      {card.isDefault ? <StatusPill label="Default" tone="success" /> : null}
                    </button>
                  );
                })
              ) : (
                <div className="theme-inline-surface rounded-[1.2rem] border border-white/75 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
                  Add a saved card in{" "}
                  <Link
                    href="/billing/payment-methods"
                    className="font-medium text-ink underline decoration-[rgba(31,36,40,0.22)] underline-offset-4"
                  >
                    Payment methods
                  </Link>{" "}
                  to complete checkout.
                </div>
              )}
            </div>
          </SurfacePanel>

          {walletPoints ? (
            <SurfacePanel className="p-4 sm:p-4">
              <div className="flex items-center gap-2 text-title-md text-ink">
                <Gift size={17} strokeWidth={1.8} />
                U-Wallet redemption
              </div>
              <div className="mt-3 text-body-sm text-ink-muted">
                Balance:{" "}
                <NumberTicker value={availablePointsValue} prefix="$" decimals={2} />{" "}
                from <NumberTicker value={availablePointsCount} /> points.
              </div>

              <div className="theme-inline-surface mt-4 space-y-2 rounded-[1.2rem] border border-[#c4d8cc] bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))] px-4 py-4 text-body-sm text-ink">
                <div className="flex items-center justify-between gap-4">
                  <span>Unlocked milestone</span>
                  <span className={canRedeemPoints ? "font-medium text-ink" : "text-ink-faint"}>
                    {canRedeemPoints ? formatStoreCurrency(unlockedMilestone) : "Not yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Max redeemable today</span>
                  <span className="font-medium text-ink">
                    {formatStoreCurrency(applicablePointsValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Next milestone</span>
                  <span className="font-medium text-ink">
                    {nextMilestone ? formatStoreCurrency(nextMilestone) : "Maxed out"}
                  </span>
                </div>
                {nextMilestone ? (
                  <div className="flex items-center justify-between gap-4">
                    <span>Remaining to unlock</span>
                    <span className="font-medium text-ink">
                      {formatStoreCurrency(remainingToNext)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="theme-inline-surface mt-3 flex items-center justify-between gap-4 rounded-[1.2rem] border border-[#c4d8cc] bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))] px-4 py-4">
                <div>
                  <div className="text-body-md font-medium text-ink">
                    Use U-Points
                  </div>
                  <div className="text-body-sm text-ink-muted">
                    {canRedeemPoints
                      ? `Applies your ${formatStoreCurrency(unlockedMilestone)} milestone to this order.`
                      : "Reach $10 in points to start redeeming."}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!canRedeemPoints}
                  onClick={() => {
                    if (!canRedeemPoints) return;
                    setUsePoints((current) => !current);
                  }}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                    usePoints ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_4px_12px_rgba(16,185,129,0.4)]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`theme-toggle-knob absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                      usePoints ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </SurfacePanel>
          ) : null}
        </div>

        <form action={completeStoreCheckoutAction}>
          <input type="hidden" name="selectedCardId" value={String(selectedCardId)} />
          <input type="hidden" name="usePoints" value={usePoints ? "1" : "0"} />
          <input type="hidden" name="redirectTo" value="/store/checkout" />

          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">
              {step === "payment" ? "Order total" : "Review & confirm"}
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-soft">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>
                  <NumberTicker value={subtotal} prefix="$" decimals={2} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>U-Wallet credit</span>
                <span className={usePoints ? "text-success" : "text-ink-faint"}>
                  -<NumberTicker value={pointsDiscount} prefix="$" decimals={2} />
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line/30 pt-3 text-title-md text-ink">
                <span>Total</span>
                <span>
                  <NumberTicker value={total} prefix="$" decimals={2} />
                </span>
              </div>
            </div>

            <CheckoutSubmitButton
              step={step}
              canComplete={canComplete}
              onAdvance={() => setStep("review")}
            />

            {step === "review" ? (
              <div className="mt-4 space-y-3">
                <div className="theme-inline-surface rounded-[1.2rem] border border-white/75 bg-white/55 px-4 py-4">
                  <div className="flex items-center gap-2 text-body-md font-medium text-ink">
                    <ShieldCheck size={16} strokeWidth={1.8} className="text-success" />
                    Confirmation summary
                  </div>
                  <div className="mt-3 space-y-2 text-body-sm text-ink-muted">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          {item.quantity}x {item.product.name}
                          {item.variant ? ` · ${item.variant.name}` : ""}
                        </span>
                        <span className="shrink-0 text-ink-soft">
                          {formatStoreCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="theme-inline-surface rounded-[1.2rem] border border-white/75 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
                  {total > 0 && selectedCardId > 0
                    ? `Your saved card will cover ${formatStoreCurrency(total)} after U-Wallet credit is applied.`
                    : total === 0
                      ? "Your U-Wallet credit covers the full order total."
                      : "Select a saved card before placing the order."}
                </div>
              </div>
            ) : null}

            <div className="theme-soft-well mt-4 flex items-start gap-3 rounded-[1.15rem] bg-white/50 px-4 py-4 text-body-sm text-ink-muted">
              <CheckCircle2 size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-success" />
              Review the cart, confirm your saved card, and apply any available U-Wallet balance before placing the order.
            </div>
          </SurfacePanel>
        </form>
        </div>
      ) : null}
    </div>
  );
}
