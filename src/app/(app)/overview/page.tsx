import Link from "next/link";
import {
  ChevronRight,
  DollarSign,
  FileText,
  Router,
  Wifi,
} from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { StatusBeacon } from "@/src/components/magic/status-beacon";
import { TextReveal } from "@/src/components/magic/text-reveal";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getBillingOverviewData } from "@/src/server/billing/api";
import { getGatewayOverviewData } from "@/src/server/gateway/api";

import RouterStage from "./RouterStage";

const actions = [
  {
    href: "/billing",
    label: "Pay now",
    icon: DollarSign,
    iconClassName:
      "border border-[#dbead9] bg-[linear-gradient(180deg,rgba(245,252,244,0.98),rgba(236,248,235,0.94))] text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
  {
    href: "/billing/invoices",
    label: "View invoices",
    icon: FileText,
    iconClassName:
      "border border-[#e6ddff] bg-[linear-gradient(180deg,rgba(247,244,255,0.98),rgba(239,235,252,0.94))] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
  {
    href: "/gateway",
    label: "Manage gateway",
    icon: Router,
    iconClassName:
      "border border-[#d9ebdf] bg-[linear-gradient(180deg,rgba(241,252,243,0.98),rgba(232,247,236,0.94))] text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
];

function getBandStyles(band: string) {
  if (band.startsWith("2.4")) {
    return {
      icon: "bg-[linear-gradient(180deg,rgba(247,243,255,0.98),rgba(236,231,252,0.94))] text-brand",
      chip: "bg-[rgba(108,69,255,0.12)] text-brand",
      line: "from-[rgba(108,69,255,0.18)] to-[rgba(108,69,255,0)]",
    };
  }

  return {
    icon: "bg-[linear-gradient(180deg,rgba(241,252,243,0.98),rgba(232,247,236,0.94))] text-success",
    chip: "bg-[rgba(52,196,59,0.12)] text-success",
    line: "from-[rgba(52,196,59,0.18)] to-[rgba(52,196,59,0)]",
  };
}

function getServiceStatusValue(connectionStatus?: string | null) {
  const normalized = connectionStatus?.trim().toLowerCase() ?? "";

  if (normalized === "connected") {
    return "Active";
  }

  if (normalized === "disconnected") {
    return "Inactive";
  }

  return connectionStatus?.trim() || "Unavailable";
}

function NetworkCard({
  label,
  devices,
  band,
  connected,
}: {
  label: string;
  devices: string;
  band: string;
  connected: boolean;
}) {
  const bandStyles = getBandStyles(band);

  return (
    <div className="theme-panel-soft rounded-[1.3rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(251,251,253,0.44))] px-4 py-4 shadow-[0_14px_28px_rgba(201,204,214,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="flex items-center gap-2.5 text-[0.95rem] font-medium tracking-[-0.035em] text-ink-soft">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-[0.85rem] ${
            connected
              ? bandStyles.icon
              : "bg-[#fff0ed] text-[#e65b4a]"
          }`}
        >
          <Wifi size={16} strokeWidth={1.9} />
        </span>
        {label}
      </div>

      <div className="mt-3 space-y-2 text-[0.86rem] tracking-[-0.02em] text-ink-muted">
        <div>{devices}</div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[0.74rem] font-medium ${connected ? bandStyles.chip : "bg-[rgba(230,91,74,0.12)] text-[#d95b49]"}`}
          >
            {band}
          </span>
          <span className={`hidden h-px flex-1 bg-gradient-to-r ${connected ? bandStyles.line : "from-[rgba(230,91,74,0.18)] to-[rgba(230,91,74,0)]"} sm:block`} />
        </div>
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [gateway, billing] = await Promise.all([
    getGatewayOverviewData(context.user.customerId, context.accessToken),
    getBillingOverviewData(context.user.customerId, context.accessToken),
  ]);
  const gatewayConnected = gateway?.isConnected ?? false;
  const serviceStatusValue = getServiceStatusValue(gateway?.connectionStatus);
  const nextBillingDate = billing.billingPeriod?.dueDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(billing.billingPeriod.dueDate))
    : "Unavailable";
  const recentPayments = billing.transactions
    .filter((entry) => entry.status === "Settled")
    .map((entry) => ({
      id: entry.id,
      href: `/billing/invoices/${encodeURIComponent(entry.invoiceNumber)}`,
      invoiceNumber: entry.invoiceNumber,
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(entry.createdAt)),
      amount: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(entry.amount),
    }));
  const radios =
    gateway?.networks.map((network) => ({
      label: network.title,
      devices: `${network.devices.length} devices`,
      band: network.band,
    })) ?? [
      { label: "5 GHz network", devices: "0 devices", band: "5 GHz" },
      { label: "2.4 GHz network", devices: "0 devices", band: "2.4 GHz" },
    ];

  return (
    <div className="flex flex-col gap-4 pb-4 lg:gap-4">
      <section className="theme-panel relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,247,249,0.62))] px-4 py-4 shadow-[0_22px_48px_rgba(205,207,214,0.11),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:px-5 sm:py-5 lg:px-7 lg:py-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="theme-shell-orb-primary absolute left-[8%] top-5 h-36 w-36 rounded-full blur-3xl" />
          <div className="theme-shell-orb-secondary absolute bottom-6 left-[30%] h-14 w-36 rounded-full blur-3xl" />
        </div>

        <div className="relative grid items-center gap-5 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-6">
          <div className="flex min-w-0 flex-col justify-center lg:pl-2">
            <div className="inline-flex max-w-full items-center gap-2.5 lg:gap-3">
              <StatusBeacon active={gatewayConnected} />
              <span className="text-[1.35rem] font-medium tracking-[-0.05em] text-ink-soft">
                <TextReveal text={`Service Status: ${serviceStatusValue}`} />
              </span>
              <span className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(222,225,231,0.8),rgba(222,225,231,0))] lg:block" />
            </div>

            <div className="mt-4 text-[3.15rem] font-medium leading-[0.94] tracking-[-0.075em] text-ink sm:text-[3.8rem] xl:text-[4.1rem]">
              <NumberTicker value={billing.amountDue} prefix="$" decimals={2} />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-[0.86rem] text-ink-muted sm:text-[0.92rem]">
                Next billing
              </div>
              <div className="text-[1.75rem] font-medium tracking-[-0.055em] text-ink sm:text-[1.95rem]">
                {nextBillingDate}
              </div>
            </div>
          </div>

          <RouterStage connected={gatewayConnected} />
        </div>
      </section>

      <section className="theme-panel-subtle relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,248,250,0.72))] px-4 py-4 shadow-[0_20px_44px_rgba(205,207,214,0.1),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="theme-shell-orb-tertiary absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl" />
        </div>

        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.82fr)_16rem] xl:gap-6">
          <div className="space-y-4 xl:pr-1">
            <h2 className="text-[1.55rem] font-medium tracking-[-0.055em] text-ink">
              Gateway
            </h2>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {radios.map((radio) => (
                <NetworkCard key={radio.label} {...radio} connected={gatewayConnected} />
              ))}
            </div>

            <div className="border-t border-line/40 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[0.82rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Recent payments
                </div>
                <div className="text-[0.82rem] text-ink-muted">
                  {recentPayments.length || 0} records
                </div>
              </div>
              {recentPayments.length ? (
                <div className="relative">
                  <div className="max-h-[16.75rem] overflow-auto pr-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-2.5 pb-16">
                      {recentPayments.map((payment) => (
                        <Link
                          key={payment.id}
                          href={payment.href}
                          className="theme-inline-surface group flex items-center justify-between gap-4 rounded-[1rem] border border-line/35 px-3.5 py-3 text-[0.9rem] tracking-[-0.03em] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(52,196,59,0.22)] hover:shadow-[0_16px_30px_rgba(193,196,206,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]"
                        >
                          <div>
                            <div className="text-[0.88rem] font-medium text-ink-soft">
                              Payment received
                            </div>
                            <div className="mt-0.5 text-[0.82rem] text-ink-muted">
                              {payment.invoiceNumber}
                            </div>
                            <span className="text-ink-muted">{payment.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[0.94rem] font-medium text-success">
                              {payment.amount}
                            </span>
                            <ChevronRight
                              size={16}
                              strokeWidth={1.9}
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
                <div className="text-[0.9rem] text-ink-muted">
                  No recent payments have been recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 xl:border-l xl:border-line/35 xl:pl-5">
            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Serial number</span>
              <span className="text-[0.9rem] font-medium tracking-[-0.03em] text-ink-soft">
                {gateway?.serialNumber || "Unavailable"}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Devices</span>
              <span className="text-[0.9rem] font-medium tracking-[-0.03em] text-ink-soft">
                {gateway?.totalDevices ?? 0}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Service status</span>
              <span
                className={`text-[0.9rem] font-medium tracking-[-0.03em] ${
                  gatewayConnected ? "text-success" : "text-[#e65b4a]"
                }`}
              >
                {serviceStatusValue}
              </span>
            </div>

            <Link
              href="/gateway"
              className="inline-flex items-center gap-1.5 pt-0.5 text-[0.88rem] font-medium tracking-[-0.03em] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              View gateway details
              <ChevronRight size={14} strokeWidth={1.9} />
            </Link>
          </div>

          <ActionCapsules className="space-y-2.5 xl:border-l xl:border-line/35 xl:pl-5">
            {actions.map((action) => (
              <ActionCapsule
                key={action.href}
                href={action.href}
                label={action.label}
                icon={<action.icon size={17} strokeWidth={1.9} />}
                iconClassName={action.iconClassName}
                className="rounded-[1.35rem] px-3.5 py-3.5"
              />
            ))}
          </ActionCapsules>
        </div>
      </section>
    </div>
  );
}
