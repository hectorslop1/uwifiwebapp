import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { TextReveal } from "@/src/components/magic/text-reveal";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { KeyValueList } from "@/src/components/ui/key-value-list";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

const activity = [
  { date: "Mar 4, 2026", label: "Automatic charge completed", amount: "$220.00" },
  { date: "Feb 3, 2026", label: "Invoice paid successfully", amount: "$55.00" },
  { date: "Jan 4, 2026", label: "Partial balance covered", amount: "$45.00" },
];

export default function BillingPage() {
  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Billing"
        title="Billing overview"
        description="A premium finance surface should feel calm and trustworthy: current balance, due timing, payment readiness and recent money movement in one consistent hierarchy."
        actions={
          <>
            <StatusPill label="Autopay active" tone="success" />
            <Link
              href="/billing/payment-methods"
              className="theme-control rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
            >
              Manage payment methods
            </Link>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
            Current balance
          </div>
          <div className="mt-2 text-[2.8rem] font-medium tracking-[-0.08em] text-ink">
            <NumberTicker value={110} prefix="$" decimals={2} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-body-sm text-ink-muted">
            <StatusPill
              label={
                <>
                  <TextReveal text="Due" /> Mar 17
                </>
              }
              tone="warning"
            />
            <span>Next billing cycle closes in 9 days.</span>
          </div>
        </SurfacePanel>

        <StatTile label="Invoices open" value="2" meta="One due soon" />
        <StatTile label="Default method" value="Visa ••42" meta="Ready for autopay" />
        <StatTile label="Cycle health" value="Stable" meta="No failed payments this quarter" />
      </div>

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1.1fr)_17rem]">
        <SurfacePanel className="p-4 sm:p-5 lg:min-h-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-title-md text-ink">Recent activity</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                Keep the narrative focused: what happened, when and for how much.
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

          <div className="mt-4 space-y-2.5 lg:max-h-[22rem] lg:overflow-auto lg:pr-1">
            {activity.map((entry) => (
              <div
                key={entry.date}
                className="theme-inline-surface flex flex-col gap-2 rounded-[1.15rem] border border-white/75 bg-white/55 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-body-md font-medium text-ink">{entry.label}</div>
                  <div className="text-body-sm text-ink-muted">{entry.date}</div>
                </div>
                <div className="text-title-md text-success">{entry.amount}</div>
              </div>
            ))}
          </div>
        </SurfacePanel>

        <div className="space-y-4">
          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Account snapshot</div>
            <div className="mt-4">
              <KeyValueList
                items={[
                  { label: "Autopay status", value: "Active", tone: "success" },
                  { label: "Primary method", value: "Visa ending in 42" },
                  { label: "Last successful charge", value: "Mar 4, 2026" },
                  { label: "Invoice delivery", value: "Email + portal" },
                ]}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Quick paths</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/billing/invoices" label="Open invoices" />
              <ActionCapsule href="/billing/payment-methods" label="Update payment method" />
              <ActionCapsule href="/store/checkout" label="Checkout review track" />
            </ActionCapsules>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
