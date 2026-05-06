import Link from "next/link";
import { Download, Eye, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { PageIntro } from "@/src/components/ui/page-intro";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getInvoices } from "@/src/server/billing/api";

import { formatCurrency, formatDate } from "../../billing-ui";

function getServiceLabel(service: Record<string, unknown>) {
  const keys = [
    "name",
    "title",
    "description",
    "service_name",
    "serviceName",
    "label",
  ] as const;

  for (const key of keys) {
    const value = service[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getServiceAmount(service: Record<string, unknown>) {
  const value = service.amount;
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export default async function BillingInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const { invoiceNumber } = await params;
  const invoices = await getInvoices(context.user.customerId, context.accessToken);
  const invoice = invoices.find(
    (entry) => entry.invoiceNumber === decodeURIComponent(invoiceNumber),
  );

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title={`Invoice ${invoice.invoiceNumber}`}
        description="Review the transaction details and open the invoice file from one place."
        actions={
          <>
            <StatusPill
              label={invoice.status}
              tone={invoice.status === "Pending" ? "warning" : "success"}
              pulse={invoice.status === "Paid"}
              variant={invoice.status === "Paid" ? "plain" : "soft"}
            />
            {invoice.fileUrl ? (
              <>
                <Link
                  href={invoice.fileUrl}
                  target="_blank"
                  className="theme-secondary-action inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Eye size={16} strokeWidth={1.8} />
                  View PDF
                </Link>
                <Link
                  href={invoice.fileUrl}
                  target="_blank"
                  className="theme-control-button inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Download size={16} strokeWidth={1.8} />
                  Download
                </Link>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Invoice total" value={formatCurrency(invoice.totalAmount)} />
        <StatTile label="Created" value={formatDate(invoice.createdAt)} />
        <StatTile label="Due date" value={formatDate(invoice.dueDate)} />
        <StatTile
          label="Remaining balance"
          value={formatCurrency(invoice.balance > 0 ? invoice.balance : 0)}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="flex items-center gap-3 text-title-md text-ink">
            <FileText size={18} strokeWidth={1.8} />
            Invoice details
          </div>

          <div className="mt-4 grid gap-2.5">
            <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                File name
              </div>
              <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                {invoice.fileName || "Unavailable"}
              </div>
            </div>

            {invoice.services.length ? (
              invoice.services.map((service, index) => (
                <div
                  key={`${invoice.invoiceNumber}-service-${index}`}
                  className="theme-inline-surface flex items-center justify-between gap-4 rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                >
                  <div>
                    <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                      Service item
                    </div>
                    <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                      {getServiceLabel(service) || "No description available"}
                    </div>
                  </div>
                  <div className="text-[0.96rem] font-medium text-ink">
                    {formatCurrency(getServiceAmount(service))}
                  </div>
                </div>
              ))
            ) : (
              <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-4 text-body-sm text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                This invoice does not include itemized services in the current backend response.
              </div>
            )}
          </div>
        </SurfacePanel>

        <SurfacePanel subtle className="p-4 sm:p-5">
          <div className="text-title-md text-ink">Summary</div>

          <div className="mt-4 grid gap-2.5">
            <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                Invoice number
              </div>
              <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                {invoice.invoiceNumber}
              </div>
            </div>

            <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                Closing balance
              </div>
              <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                {formatCurrency(invoice.closingBalance)}
              </div>
            </div>

            <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                Discount
              </div>
              <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                {formatCurrency(invoice.discount)}
              </div>
            </div>

            <div className="theme-inline-surface rounded-[1rem] border border-white/80 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                U-Points
              </div>
              <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                {invoice.uPoints}
              </div>
            </div>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
