import Link from "next/link";
import { Download, Eye } from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

const invoices = [
  { id: "INV-1042", date: "Mar 4, 2026", amount: "$220.00", status: "Paid" },
  { id: "INV-1028", date: "Feb 3, 2026", amount: "$55.00", status: "Paid" },
  { id: "INV-1007", date: "Jan 4, 2026", amount: "$45.00", status: "Pending" },
];

export default function BillingInvoicesPage() {
  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Invoices"
        description="This route replaces manual table layouts with a reusable SaaS table pattern: quiet header, clear filters and obvious document actions."
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

        <ProgressiveBlur className="mt-4" maxHeightClassName="max-h-[24rem]">
          <PremiumTable
            columns={[
              { key: "invoice", label: "Invoice" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "status", label: "Status", align: "center" },
              { key: "actions", label: "Actions", align: "right" },
            ]}
            rows={invoices.map((invoice) => ({
              id: invoice.id,
              cells: [
                <div key={`${invoice.id}-number`}>
                  <div className="font-medium text-ink">{invoice.id}</div>
                  <div className="text-label-md text-ink-muted">Monthly service invoice</div>
                </div>,
                invoice.date,
                <span key={`${invoice.id}-amount`} className="font-medium text-ink">
                  {invoice.amount}
                </span>,
                <div key={`${invoice.id}-status`} className="flex justify-center">
                  <StatusPill
                    label={invoice.status}
                    tone={invoice.status === "Pending" ? "warning" : "success"}
                  />
                </div>,
                <div key={`${invoice.id}-actions`} className="flex justify-end gap-3">
                  <Link href="#" className="inline-flex items-center gap-1 text-body-sm text-ink-soft hover:text-ink">
                    <Eye size={15} strokeWidth={1.8} />
                    View
                  </Link>
                  <Link href="#" className="inline-flex items-center gap-1 text-body-sm text-ink-soft hover:text-ink">
                    <Download size={15} strokeWidth={1.8} />
                    PDF
                  </Link>
                </div>,
              ],
            }))}
          />
        </ProgressiveBlur>
      </SurfacePanel>
    </div>
  );
}
