import { CreditCard, Plus } from "lucide-react";

import { InteractiveHoverButton } from "@/src/components/magic/interactive-hover-button";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

const methods = [
  { id: "visa-42", brand: "Visa", last4: "4242", expiry: "04/28", default: true },
  { id: "amex-88", brand: "Amex", last4: "0088", expiry: "11/27", default: false },
];

export default function BillingPaymentMethodsPage() {
  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Payment methods"
        description="This page intentionally removes the old decorative credit-card visuals. The premium move is clarity: brand, status, expiry, default method and an obvious add-card flow."
      />

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1.1fr)_18rem]">
        <div className="space-y-3 lg:min-h-0 lg:overflow-auto lg:pr-1">
          {methods.map((method) => (
            <SurfacePanel key={method.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                  <span className="theme-icon-surface flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/80 text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <CreditCard size={19} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="text-body-md font-medium text-ink">
                      {method.brand} ending in {method.last4}
                    </div>
                    <div className="text-body-sm text-ink-muted">
                      Expires {method.expiry}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {method.default ? <StatusPill label="Default" tone="success" /> : null}
                  <button
                    type="button"
                    className="theme-control rounded-pill border border-white/80 bg-white/65 px-4 py-2 text-body-sm text-ink-soft"
                  >
                    {method.default ? "Edit" : "Set as default"}
                  </button>
                </div>
              </div>
            </SurfacePanel>
          ))}
        </div>

          <SurfacePanel subtle className="p-4">
          <div className="flex items-center gap-3 text-title-md text-ink">
            <Plus size={17} strokeWidth={1.8} />
            Add a payment method
          </div>
          <p className="mt-3 text-body-sm text-ink-muted">
            The final flow will open a side sheet with form validation, card brand detection and a strong success state instead of a generic modal.
          </p>
          <InteractiveHoverButton
            type="button"
            className="theme-cta mt-5 w-full rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
          >
            Save payment method
          </InteractiveHoverButton>
          <div className="theme-inline-surface mt-5 rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
            Security note: card details should never be rendered as decorative art. This cleaner treatment increases trust and readability.
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
