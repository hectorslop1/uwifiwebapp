import Link from "next/link";
import { Download, Eye } from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getInvoices } from "@/src/server/billing/api";

import { formatCurrency, formatDate } from "../billing-ui";

export default async function BillingInvoicesPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const invoices = await getInvoices(context.user.customerId, context.accessToken);

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Invoices"
        description="Open the invoice detail, review the status, and access the PDF from one place."
      />

      <SurfacePanel className="p-4 lg:min-h-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", "Paid", "Pending", "This year"].map((filter, index) => (
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

          <div className="theme-inline-surface rounded-pill border border-white/80 bg-white/55 px-4 py-2 text-body-sm text-ink-muted">
            Search by invoice number will live here.
          </div>
        </div>

        <div className="relative mt-4">
          <div className="max-h-[24rem] overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="pb-14">
              <PremiumTable
                columns={[
                  { key: "invoice", label: "Invoice" },
                  { key: "date", label: "Date" },
                  { key: "amount", label: "Amount", align: "right" },
                  { key: "status", label: "Status", align: "center" },
                  { key: "actions", label: "Actions", align: "right" },
                ]}
                rows={invoices.map((invoice) => ({
                  id: invoice.invoiceNumber,
                  cells: [
                    <div key={`${invoice.invoiceNumber}-number`}>
                      <Link
                        href={`/billing/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}
                        className="font-medium text-ink transition-colors duration-200 hover:text-success"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <div className="text-label-md text-ink-muted">
                        Monthly service invoice
                      </div>
                    </div>,
                    formatDate(invoice.createdAt),
                    <span
                      key={`${invoice.invoiceNumber}-amount`}
                      className="font-medium text-ink"
                    >
                      {formatCurrency(invoice.totalAmount)}
                    </span>,
                    <div
                      key={`${invoice.invoiceNumber}-status`}
                      className="flex justify-center"
                    >
                      <StatusPill
                        label={invoice.status}
                        tone={invoice.status === "Pending" ? "warning" : "success"}
                      />
                    </div>,
                    <div
                      key={`${invoice.invoiceNumber}-actions`}
                      className="flex justify-end gap-3"
                    >
                      <Link
                        href={`/billing/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}
                        className="inline-flex items-center gap-1 text-body-sm text-ink-soft hover:text-ink"
                      >
                        <Eye size={15} strokeWidth={1.8} />
                        Details
                      </Link>
                      {invoice.fileUrl ? (
                        <Link
                          href={invoice.fileUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-body-sm text-ink-soft hover:text-ink"
                        >
                          <Download size={15} strokeWidth={1.8} />
                          PDF
                        </Link>
                      ) : (
                        <span className="text-body-sm text-ink-faint">No file</span>
                      )}
                    </div>,
                  ],
                }))}
              />
            </div>
          </div>
          <ProgressiveBlur position="bottom" height="38%" />
        </div>
      </SurfacePanel>
    </div>
  );
}
