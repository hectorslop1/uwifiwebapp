import { CreditCard, Trash2 } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getPaymentMethods } from "@/src/server/billing/api";
import type { PaymentMethod } from "@/src/server/billing/types";

import {
  deletePaymentMethodAction,
  setDefaultPaymentMethodAction,
} from "../actions";
import {
  BillingFlash,
  formatCardLabel,
  getFlashMessage,
} from "../billing-ui";
import { PaymentMethodAddCardPanel } from "../payment-method-add-card-panel";

export default async function BillingPaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const query = await searchParams;
  const flash = getFlashMessage(query);
  let methods: PaymentMethod[] = [];
  let loadError = "";

  try {
    methods = await getPaymentMethods(
      context.user.customerId,
      context.accessToken,
    );
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "No fue posible cargar los métodos de pago.";
  }

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Payment methods"
        description="Manage the cards saved to your account for billing and upcoming purchases."
      />

      {flash ? <BillingFlash tone={flash.status}>{flash.message}</BillingFlash> : null}
      {loadError ? <BillingFlash tone="error">{loadError}</BillingFlash> : null}

      <div className="space-y-4 lg:flex-1">
        <div className="space-y-3">
          {methods.length ? (
            methods.map((method) => (
              <SurfacePanel key={method.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="theme-icon-surface flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/80 text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <CreditCard size={19} strokeWidth={1.8} />
                    </span>
                    <div>
                      <div className="text-body-md font-medium text-ink">
                        {formatCardLabel(method.cardBrand, method.last4Digits)}
                      </div>
                      <div className="text-body-sm text-ink-muted">
                        Expires {method.expirationMonth || "--"}/{method.expirationYear || "--"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {method.isDefault ? <StatusPill label="Default" tone="success" /> : null}

                    {method.isDefault ? (
                      <span className="theme-control-button inline-flex items-center rounded-full border px-4 py-2.5 text-body-sm text-ink-muted">
                        Default card
                      </span>
                    ) : (
                      <form action={setDefaultPaymentMethodAction}>
                        <input type="hidden" name="cardId" value={String(method.id)} />
                        <button
                          type="submit"
                          className="theme-control-button inline-flex items-center rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                        >
                          Set as default
                        </button>
                      </form>
                    )}

                    <form action={deletePaymentMethodAction}>
                      <input type="hidden" name="cardId" value={String(method.id)} />
                      <button
                        type="submit"
                        className="theme-control-button inline-flex items-center rounded-full border px-3.5 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 size={14} strokeWidth={1.8} />
                          Remove
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </SurfacePanel>
            ))
          ) : (
            <SurfacePanel className="p-4">
              <div className="text-body-md font-medium text-ink">No saved payment methods</div>
              <div className="mt-2 text-body-sm text-ink-muted">
                Add your first card to save a payment method for billing.
              </div>
            </SurfacePanel>
          )}
        </div>

        <PaymentMethodAddCardPanel />
      </div>
    </div>
  );
}
