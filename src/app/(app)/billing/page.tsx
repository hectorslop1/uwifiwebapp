import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  DollarSign,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { NumberTicker } from "@/src/components/magic/number-ticker";
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
  const recentActivityFeed = overview.transactions.slice(0, 5);
  const openInvoices = overview.invoices.filter((invoice) => invoice.status === "Pending");
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
              pulse={overview.autoPayEnabled === true}
              variant={overview.autoPayEnabled === true ? "plain" : "soft"}
            />
            <form action={payBalanceNowAction}>
              <button
                type="submit"
                className="theme-primary-action inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                <DollarSign size={16} strokeWidth={1.8} />
                Pay current balance
              </button>
            </form>
            <Link
              href="/billing/payment-methods"
              className="theme-control-button inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <WalletCards size={16} strokeWidth={1.8} />
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
              tone={overview.amountDue > 0 ? "warning" : "muted"}
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

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.14fr)_minmax(18.5rem,0.86fr)]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-title-md text-ink">Recent activity</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                See your most recent billing movements and payment activity.
              </div>
            </div>

            <Link
              href="/billing/invoices"
              className="inline-flex items-center gap-2 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Open invoices
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="mt-4">
            {recentActivityFeed.length ? (
              <div className="relative">
                <div className="max-h-[14.5rem] overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="space-y-2.5 pb-14">
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
                <ProgressiveBlur position="bottom" height="40%" />
              </div>
            ) : (
              <div className="theme-inline-surface rounded-[1.15rem] border border-line/35 px-4 py-4 text-body-sm text-ink-muted">
                No billing activity has been generated yet.
              </div>
            )}
          </div>
        </SurfacePanel>

        <div>
          <SurfacePanel subtle className="relative overflow-hidden p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.08),transparent_74%)]" />
            <div className="relative">
              <div className="text-title-md text-ink">Billing tools</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                Keep the essentials in view without stretching the sidebar.
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
                  <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Primary method</div>
                  <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                    {primaryMethod ? formatCardLabel(primaryMethod.cardBrand, primaryMethod.last4Digits) : "No saved card"}
                  </div>
                </div>
                <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                  <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Due date</div>
                  <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                    {dueDateLabel}
                  </div>
                </div>
                <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                  <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">Last successful charge</div>
                  <div className="mt-1 text-[0.96rem] font-medium text-ink-soft">
                    {lastSuccessfulCharge ? formatDate(lastSuccessfulCharge.createdAt) : "No charge yet"}
                  </div>
                </div>
              </div>

              <div className="theme-soft-well mt-3 rounded-[1.1rem] border border-line/30 px-4 py-3.5">
                <div className="mb-2 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  AutoPay controls
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-[15rem] text-body-sm text-ink-muted">
                    {overview.autoPayEnabled
                      ? "AutoPay is active. Keep this separate from your routine actions."
                      : "Enable AutoPay when you want billing to run automatically."}
                  </div>
                  <form action={toggleAutopayAction}>
                    <input
                      type="hidden"
                      name="enable"
                      value={overview.autoPayEnabled ? "false" : "true"}
                    />
                    <button
                        type="submit"
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] ${overview.autoPayEnabled ? "theme-sensitive-action" : "theme-control-button"}`}
                      >
                      {overview.autoPayEnabled ? "Disable AutoPay" : "Enable AutoPay"}
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-3 border-t border-line/25 pt-3">
                <div className="text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  Quick paths
                </div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <Link
                    href="/billing/invoices"
                    className="theme-control-button group flex min-h-[3rem] items-center gap-3 rounded-[1.05rem] border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                  >
                    <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] text-brand">
                      <ReceiptText size={16} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 text-[0.92rem] font-medium text-ink-soft transition-colors duration-200 group-hover:text-ink">
                      Open invoices
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-soft"
                    />
                  </Link>
                  <Link
                    href="/billing/payment-methods"
                    className="theme-control-button group flex min-h-[3rem] items-center gap-3 rounded-[1.05rem] border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                  >
                    <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] text-success">
                      <CreditCard size={16} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 text-[0.92rem] font-medium text-ink-soft transition-colors duration-200 group-hover:text-ink">
                      Update payment method
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-soft"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
