import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getTransactions } from "@/src/server/billing/api";

import { formatCurrency, formatDate } from "../billing-ui";

export default async function BillingTransactionsPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const transactions = await getTransactions(
    context.user.customerId,
    context.accessToken,
  );

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Transactions"
        description="Invoices and transactions now share a single table language. That consistency is what makes the product feel like one premium system instead of multiple dashboards."
      />

      <SurfacePanel className="p-4 lg:min-h-0">
        <div className="flex flex-wrap gap-2">
          {["Newest first", "Settled", "Wallet", "Card payments"].map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-pill px-4 py-2 text-body-sm transition-colors duration-200 ${
                index === 0
                  ? "theme-control-active bg-white/90 text-ink shadow-[0_10px_22px_rgba(201,204,214,0.14)]"
                  : "theme-control-muted bg-white/45 text-ink-muted hover:bg-white/45 hover:text-ink-soft"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <ProgressiveBlur className="mt-4" maxHeightClassName="max-h-[24rem]">
          <PremiumTable
            columns={[
              { key: "type", label: "Type" },
              { key: "date", label: "Date" },
              { key: "method", label: "Method" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ]}
            rows={transactions.map((transaction) => ({
              id: transaction.id,
              cells: [
                <div key={`${transaction.id}-type`}>
                  <div className="font-medium text-ink">{transaction.transactionType}</div>
                  <div className="text-label-md text-ink-muted">{transaction.invoiceNumber}</div>
                </div>,
                formatDate(transaction.createdAt),
                transaction.methodLabel,
                <span key={`${transaction.id}-amount`} className="font-medium text-ink">
                  {formatCurrency(transaction.amount)}
                </span>,
                <div key={`${transaction.id}-status`} className="flex justify-end">
                  <StatusPill
                    label={transaction.status}
                    tone={transaction.status === "Pending" ? "warning" : "success"}
                  />
                </div>,
              ],
            }))}
          />
        </ProgressiveBlur>
      </SurfacePanel>
    </div>
  );
}
