import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { KeyValueList } from "@/src/components/ui/key-value-list";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getBillingOverviewData } from "@/src/server/billing/api";

import { payBalanceNowAction, toggleAutopayAction } from "./actions";
import {
  BillingFlash,
  formatCardLabel,
  formatCurrency,
  formatDate,
  getFlashMessage,
} from "./billing-ui";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, overview] = await Promise.all([
    searchParams,
    getBillingOverviewData(context.user.customerId, context.accessToken),
  ]);
  const flash = getFlashMessage(query);
  const primaryMethod = overview.paymentMethods.find((card) => card.isDefault) ?? overview.paymentMethods[0] ?? null;
  const recentActivity = overview.transactions.slice(0, 3);
  const openInvoices = overview.invoices.filter((invoice) => invoice.status === "Pending");
  const dueDateLabel = formatDate(overview.billingPeriod?.dueDate);
  const cycleEndLabel = formatDate(overview.billingPeriod?.currentBillingPeriod.endDate);
  const autoPayLabel =
    overview.autoPayEnabled === true
      ? "Autopay active"
      : primaryMethod
        ? "Autopay available"
        : "No payment method";

  return (
    <div className="space-y-3 pb-2 xl:[zoom:0.94] 2xl:[zoom:1]">
      <PageIntro
        eyebrow="Billing"
        title="Billing overview"
        description="Review your current balance, payment timing, default method, and recent billing activity."
        actions={
          <>
            <StatusPill
              label={autoPayLabel}
              tone={
                overview.autoPayEnabled === true
                  ? "success"
                  : primaryMethod
                    ? "brand"
                    : "warning"
              }
            />
            <form action={payBalanceNowAction}>
              <button
                type="submit"
                className="theme-control rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2.5 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
              >
                Pay current balance
              </button>
            </form>
            <Link
              href="/billing/payment-methods"
              className="theme-control rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2.5 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
            >
              Manage payment methods
            </Link>
          </>
        }
      />

      {flash ? <BillingFlash tone={flash.status}>{flash.message}</BillingFlash> : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
            Amount due
          </div>
          <div className="mt-2 text-[2.8rem] font-medium tracking-[-0.08em] text-ink">
            <NumberTicker value={overview.amountDue} prefix="$" decimals={2} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-body-sm text-ink-muted">
            <StatusPill
              label={`Due ${dueDateLabel}`}
              tone="warning"
            />
            <span>Cycle closes {cycleEndLabel}.</span>
          </div>
        </SurfacePanel>

        <StatTile
          label="Invoices open"
          value={String(openInvoices.length)}
          meta={openInvoices.length ? `${formatCurrency(openInvoices[0].totalAmount)} due next` : "No unpaid invoices"}
        />
        <StatTile
          label="Default method"
          value={primaryMethod ? formatCardLabel(primaryMethod.cardBrand, primaryMethod.last4Digits) : "None"}
          meta={primaryMethod ? "Ready for billing" : "Add a payment method"}
        />
        <StatTile
          label="Cycle health"
          value={overview.autoPayEnabled ? "Stable" : "Attention"}
          meta={
            overview.autoPayEnabled
              ? "AutoPay is enabled for this account"
              : "Manual payment flow is currently active"
          }
        />
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.1fr)_17rem]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-title-md text-ink">Recent activity</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                See your most recent billing movements and payment activity.
              </div>
            </div>

            <Link
              href="/billing/transactions"
              className="inline-flex items-center gap-2 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              View full history
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {recentActivity.length ? (
              recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="theme-inline-surface flex flex-col gap-2 rounded-[1.15rem] border border-white/75 bg-white/55 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-body-md font-medium text-ink">{entry.transactionType}</div>
                    <div className="text-body-sm text-ink-muted">{formatDate(entry.createdAt)}</div>
                  </div>
                  <div className={entry.status === "Settled" ? "text-title-md text-success" : "text-title-md text-ink"}>
                    {formatCurrency(entry.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="theme-inline-surface rounded-[1.15rem] border border-white/75 bg-white/55 px-4 py-4 text-body-sm text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                No billing activity has been generated yet.
              </div>
            )}
          </div>
        </SurfacePanel>

        <div className="space-y-3">
          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Account snapshot</div>
            <div className="mt-4">
              <KeyValueList
                items={[
                  {
                    label: "Autopay status",
                    value: overview.autoPayEnabled ? "Active" : "Manual",
                    tone: overview.autoPayEnabled ? "success" : "default",
                  },
                  {
                    label: "Primary method",
                    value: primaryMethod
                      ? `${primaryMethod.cardBrand} ending in ${primaryMethod.last4Digits}`
                      : "No saved card",
                  },
                  {
                    label: "Last successful charge",
                    value: recentActivity.find((entry) => entry.status === "Settled")
                      ? formatDate(recentActivity.find((entry) => entry.status === "Settled")?.createdAt)
                      : "No charge yet",
                  },
                  { label: "Invoice delivery", value: "Email + portal" },
                ]}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={toggleAutopayAction}>
                <input
                  type="hidden"
                  name="enable"
                  value={overview.autoPayEnabled ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="theme-control rounded-pill border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,251,244,0.9))] px-4 py-2 text-body-sm font-medium text-ink shadow-[0_14px_30px_rgba(196,199,208,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(246,255,245,0.98),rgba(237,250,236,0.94))]"
                >
                  {overview.autoPayEnabled ? "Disable AutoPay" : "Enable AutoPay"}
                </button>
              </form>
            </div>
            <div className="mt-4 border-t border-line/25 pt-4">
              <div className="text-title-md text-ink">Quick paths</div>
              <ActionCapsules className="mt-4">
                <ActionCapsule href="/billing/invoices" label="Open invoices" />
                <ActionCapsule href="/billing/payment-methods" label="Update payment method" />
                <ActionCapsule href="/billing/transactions" label="View transactions" />
              </ActionCapsules>
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
