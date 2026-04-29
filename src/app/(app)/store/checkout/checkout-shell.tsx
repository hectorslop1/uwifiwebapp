"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Gift } from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import {
  checkoutItems,
  walletCards,
  walletSummary,
} from "@/src/lib/mock-portal-data";

type CheckoutStep = "payment" | "review";

export function CheckoutShell() {
  const [step, setStep] = useState<CheckoutStep>("payment");
  const [selectedCardId, setSelectedCardId] = useState(walletCards[0]?.id ?? "");
  const [usePoints, setUsePoints] = useState(true);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [],
  );
  const pointsDiscount = usePoints ? Math.min(walletSummary.usdEquivalent, subtotal) : 0;
  const total = subtotal - pointsDiscount;

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Store"
        title="Checkout"
        description="This keeps the Flutter checkout function set alive: order review, payment method selection and U-Wallet redemption. The difference is a calmer 2-step structure."
        actions={
          <SegmentedControl
            value={step}
            onChange={setStep}
            options={[
              { value: "payment", label: "1. Payment" },
              { value: "review", label: "2. Review" },
            ]}
          />
        }
      />

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1.1fr)_20rem]">
        <div className="space-y-4 lg:min-h-0 lg:overflow-auto lg:pr-1">
          <SurfacePanel className="p-4 sm:p-5">
            <div className="text-title-md text-ink">Selected items</div>
            <div className="mt-4 space-y-3">
              {checkoutItems.map((item) => (
                <div
                  key={item.id}
                  className="theme-inline-surface flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/75 bg-white/55 px-4 py-4"
                >
                  <div>
                    <div className="text-body-md font-medium text-ink">{item.name}</div>
                    <div className="text-body-sm text-ink-muted">Quantity {item.quantity}</div>
                  </div>
                  <div className="text-body-md font-medium text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </SurfacePanel>

          <SurfacePanel className="p-4 sm:p-5">
            <div className="text-title-md text-ink">Payment method</div>
            <div className="mt-4 space-y-3">
              {walletCards.map((card) => {
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
                          {card.brand} ending in {card.last4}
                        </div>
                        <div className="text-body-sm text-ink-muted">Expires {card.expiry}</div>
                      </div>
                    </div>

                    {card.isDefault ? <StatusPill label="Default" tone="success" /> : null}
                  </button>
                );
              })}
            </div>
          </SurfacePanel>

          <SurfacePanel className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <Gift size={17} strokeWidth={1.8} />
              U-Wallet redemption
            </div>
            <div className="mt-3 text-body-sm text-ink-muted">
              Available value: <NumberTicker value={walletSummary.usdEquivalent} prefix="$" decimals={2} /> from{" "}
              <NumberTicker value={walletSummary.availablePoints} /> points.
            </div>
            <div className="theme-inline-surface mt-4 flex items-center justify-between rounded-[1.2rem] border border-white/75 bg-white/55 px-4 py-4">
              <div>
                <div className="text-body-md font-medium text-ink">Apply available points</div>
                <div className="text-body-sm text-ink-muted">
                  Use wallet value before charging the card.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsePoints((current) => !current)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  usePoints ? "bg-success/85" : "bg-line-strong/70"
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
        </div>

        <SurfacePanel subtle className="p-4">
          <div className="text-title-md text-ink">Order total</div>
          <div className="mt-4 space-y-3 text-body-sm text-ink-soft">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span><NumberTicker value={subtotal} prefix="$" decimals={2} /></span>
            </div>
            <div className="flex items-center justify-between">
              <span>U-Wallet credit</span>
              <span className={usePoints ? "text-success" : "text-ink-faint"}>
                -<NumberTicker value={pointsDiscount} prefix="$" decimals={2} />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line/30 pt-3 text-title-md text-ink">
              <span>Total</span>
              <span><NumberTicker value={total} prefix="$" decimals={2} /></span>
            </div>
          </div>

          <button
            type="button"
            className="theme-cta mt-5 w-full rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
          >
            {step === "payment" ? "Continue to review" : "Place order"}
          </button>

          <div className="theme-soft-well mt-4 flex items-start gap-3 rounded-[1.15rem] bg-white/50 px-4 py-4 text-body-sm text-ink-muted">
            <CheckCircle2 size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-success" />
            Payment confidence, points usage and order summary now live in one clear surface instead of many stacked cards.
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
