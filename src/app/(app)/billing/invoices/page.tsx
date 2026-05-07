import Link from "next/link";
import { Download, Eye, Search } from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getInvoices } from "@/src/server/billing/api";

import { formatCurrency, formatDate } from "../billing-ui";

function buildInvoiceFilterHref(
  filter: string,
  query: string,
) {
  const params = new URLSearchParams();

  if (filter && filter !== "all") {
    params.set("filter", filter);
  }

  if (query.trim()) {
    params.set("q", query.trim());
  }

  const serialized = params.toString();
  return serialized ? `/billing/invoices?${serialized}` : "/billing/invoices";
}

export default async function BillingInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, invoices] = await Promise.all([
    searchParams,
    getInvoices(context.user.customerId, context.accessToken),
  ]);
  const rawFilter = Array.isArray(query.filter) ? query.filter[0] : query.filter;
  const activeFilter =
    rawFilter === "paid" || rawFilter === "pending" || rawFilter === "year"
      ? rawFilter
      : "all";
  const searchTerm = (
    Array.isArray(query.q) ? query.q[0] : query.q
  )?.trim() ?? "";
  const currentYear = new Date().getFullYear();
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      !searchTerm ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const createdYear = new Date(invoice.createdAt).getFullYear();
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "paid"
          ? invoice.status === "Paid"
          : activeFilter === "pending"
            ? invoice.status === "Pending"
            : createdYear === currentYear;

    return matchesSearch && matchesFilter;
  });
  const filters = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "This year", value: "year" },
  ];

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
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={buildInvoiceFilterHref(filter.value, searchTerm)}
                className={`rounded-pill px-4 py-2 text-body-sm transition-colors duration-200 ${
                  activeFilter === filter.value
                    ? "theme-control-active bg-white/90 text-ink shadow-[0_10px_22px_rgba(201,204,214,0.14)]"
                    : "theme-control-muted bg-white/45 text-ink-muted hover:bg-white/45 hover:text-ink-soft"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <form action="/billing/invoices" className="theme-input-shell flex w-full max-w-[22rem] items-center gap-3 rounded-pill border px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <Search size={16} strokeWidth={1.8} className="text-ink-muted" />
            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search invoice number..."
              className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-faint"
            />
            {activeFilter !== "all" ? (
              <input type="hidden" name="filter" value={activeFilter} />
            ) : null}
          </form>
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
                rows={filteredInvoices.map((invoice) => ({
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

        {!filteredInvoices.length ? (
          <div className="mt-4 rounded-[1rem] border border-white/80 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
            No invoices match the current filter.
          </div>
        ) : null}
      </SurfacePanel>
    </div>
  );
}
