import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { NumberTicker } from "@/src/components/magic/number-ticker";
import { PageIntro } from "@/src/components/ui/page-intro";
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
  const recentActivityFeed = overview.transactions.slice(0, 5);
  const dueDateLabel = formatDate(overview.billingPeriod?.dueDate);
  const cycleEndLabel = formatDate(overview.billingPeriod?.currentBillingPeriod.endDate);
  const lastSuccessfulCharge = overview.transactions.find(
    (entry) => entry.status === "Settled",
  );
  const autoPayLabel =
    overview.autoPayEnabled === true
      ? "Autopay active"
      : primaryMethod
        ? "Autopay available"
        : "No payment method";

  return (
    <div className="space-y-4 pb-4 xl:[zoom:0.98] 2xl:[zoom:1]">
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
              pulse={overview.autoPayEnabled === true}
              variant={overview.autoPayEnabled === true ? "plain" : "soft"}
            />
            <form action={payBalanceNowAction}>
              <button
                type="submit"
                className="theme-cta inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                <DollarSign size={16} strokeWidth={1.8} />
                Pay current balance
              </button>
            </form>
            <Link
              href="/billing/payment-methods"
              className="theme-secondary-action inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <WalletCards size={16} strokeWidth={1.8} />
              Manage payment methods
            </Link>
          </>
        }
      />

      {flash ? <BillingFlash tone={flash.status}>{flash.message}</BillingFlash> : null}

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(18.75rem,0.82fr)]">
        <div className="grid items-start gap-3 xl:grid-cols-2">
          <SurfacePanel className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-label-md uppercase tracking-[0.14em] text-ink-faint">
              <span className="theme-icon-surface flex h-8 w-8 items-center justify-center rounded-full text-success">
                <DollarSign size={14} strokeWidth={1.9} />
              </span>
              Amount due
            </div>
            <div className="mt-3 text-[2.35rem] font-medium tracking-[-0.075em] text-ink sm:text-[2.7rem]">
              <NumberTicker value={overview.amountDue} prefix="$" decimals={2} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-body-sm text-ink-muted">
              <StatusPill
                label={`Due ${dueDateLabel}`}
                tone={overview.amountDue > 0 ? "warning" : "muted"}
              />
              <span className="rounded-pill bg-[rgba(108,69,255,0.08)] px-3 py-1.5 text-[0.78rem] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                Cycle closes {cycleEndLabel}
              </span>
            </div>
          </SurfacePanel>

          <SurfacePanel className="p-4 sm:p-5">
            <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
              Default method
            </div>
            <div className="mt-3 text-[1.75rem] font-medium tracking-[-0.065em] text-ink">
              {primaryMethod
                ? formatCardLabel(primaryMethod.cardBrand, primaryMethod.last4Digits)
                : "No card saved"}
            </div>
            <div className="mt-2 text-body-sm text-ink-muted">
              {primaryMethod
                ? "Ready for billing and upcoming purchases."
                : "Add a payment method to enable faster checkout and billing."}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <StatusPill
                label={overview.autoPayEnabled ? "AutoPay active" : "Manual payments"}
                tone={overview.autoPayEnabled ? "success" : "warning"}
                pulse={overview.autoPayEnabled === true}
                variant={overview.autoPayEnabled ? "plain" : "soft"}
              />
              <span className="rounded-pill bg-white/72 px-3 py-1.5 text-[0.78rem] text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                {lastSuccessfulCharge
                  ? `Last charge ${formatDate(lastSuccessfulCharge.createdAt)}`
                  : "No successful charge yet"}
              </span>
            </div>
          </SurfacePanel>

          <SurfacePanel className="xl:col-span-2 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-title-md text-ink">Recent activity</div>
                <div className="mt-1 text-body-sm text-ink-muted">
                  See your most recent billing movements and payment activity.
                </div>
              </div>

              <Link
                href="/billing/invoices"
                className="theme-secondary-action inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                Open invoices
                <ArrowUpRight size={15} strokeWidth={1.8} />
              </Link>
            </div>

            <div className="mt-4">
              {recentActivityFeed.length ? (
                <div className="relative">
                  <div className="max-h-[13.25rem] overflow-auto pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-2.5 pb-6">
                      {recentActivityFeed.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/billing/invoices/${encodeURIComponent(entry.invoiceNumber)}`}
                          className="theme-inline-surface group flex flex-col gap-3 rounded-[1.15rem] border border-line/35 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(52,196,59,0.22)] hover:shadow-[0_16px_30px_rgba(193,196,206,0.1),inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="text-body-md font-medium text-ink">
                              {entry.transactionType}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-ink-muted">
                              <span>{entry.invoiceNumber}</span>
                              <span className="h-1 w-1 rounded-full bg-line-strong/80" />
                              <span>{formatDate(entry.createdAt)}</span>
                              <span className="h-1 w-1 rounded-full bg-line-strong/80" />
                              <span>{entry.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                entry.status === "Settled"
                                  ? "text-title-md text-success"
                                  : "text-title-md text-ink"
                              }
                            >
                              {formatCurrency(entry.amount)}
                            </div>
                            <ArrowUpRight
                              size={15}
                              strokeWidth={1.8}
                              className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-soft"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <ProgressiveBlur position="bottom" height="28%" />
                </div>
              ) : (
                <div className="theme-inline-surface rounded-[1.15rem] border border-line/35 px-4 py-4 text-body-sm text-ink-muted">
                  No billing activity has been generated yet.
                </div>
              )}
            </div>
          </SurfacePanel>
        </div>

        <SurfacePanel subtle className="relative overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.08),transparent_74%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-full text-brand">
                <WalletCards size={16} strokeWidth={1.8} />
              </span>
              Billing tools
            </div>
            <div className="mt-1 text-body-sm text-ink-muted">
              Keep billing status and the next action within reach.
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Autopay</div>
                <div className="mt-1.5">
                  <StatusPill
                    label={overview.autoPayEnabled ? "Active" : "Manual"}
                    tone={overview.autoPayEnabled ? "success" : "warning"}
                    pulse={overview.autoPayEnabled === true}
                    variant={overview.autoPayEnabled ? "plain" : "soft"}
                    className="text-[0.96rem] font-medium"
                  />
                </div>
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Due date</div>
                <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                  {dueDateLabel}
                </div>
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Primary method</div>
                <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                  {primaryMethod
                    ? formatCardLabel(primaryMethod.cardBrand, primaryMethod.last4Digits)
                    : "No saved card"}
                </div>
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Last charge</div>
                <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                  {lastSuccessfulCharge
                    ? formatDate(lastSuccessfulCharge.createdAt)
                    : "No charge yet"}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <form action={toggleAutopayAction} className="sm:flex-1">
                <input
                  type="hidden"
                  name="enable"
                  value={overview.autoPayEnabled ? "false" : "true"}
                />
                <button
                  type="submit"
                  className={`inline-flex min-h-[2.95rem] w-full items-center justify-center rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] ${overview.autoPayEnabled ? "theme-sensitive-action" : "theme-control-button"}`}
                >
                  {overview.autoPayEnabled ? "Disable AutoPay" : "Enable AutoPay"}
                </button>
              </form>
              <Link
                href="/billing/invoices"
                className="theme-control-button inline-flex min-h-[2.95rem] items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] sm:flex-1"
              >
                <ReceiptText size={15} strokeWidth={1.8} />
                Open invoices
              </Link>
            </div>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
