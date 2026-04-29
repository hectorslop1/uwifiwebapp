import Link from "next/link";
import {
  ChevronRight,
  DollarSign,
  FileText,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { InteractiveHoverButtonLink } from "@/src/components/magic/interactive-hover-button";
import { NumberTicker } from "@/src/components/magic/number-ticker";
import { StatusBeacon } from "@/src/components/magic/status-beacon";
import { TextReveal } from "@/src/components/magic/text-reveal";

import RouterStage from "./RouterStage";

const payments = [
  { date: "Mar 4, 2026", amount: "$220.00" },
  { date: "Feb 3, 2026", amount: "$55.00" },
  { date: "Jan 4, 2026", amount: "$45.00" },
];

const radios = [
  { label: "U-WiFi 5G", devices: "0 devices", band: "5 GHz" },
  { label: "U-WiFi", devices: "0 devices", band: "2.4 GHz" },
];

const actions = [
  {
    href: "/billing",
    label: "Pay now",
    icon: DollarSign,
    iconClassName: "bg-success-soft text-success",
  },
  {
    href: "/billing/invoices",
    label: "View invoices",
    icon: FileText,
    iconClassName: "bg-surface-raised/80 text-ink-soft",
  },
  {
    href: "/gateway",
    label: "Manage gateway",
    icon: Wifi,
    iconClassName: "bg-brand-soft text-brand",
  },
];

function NetworkCard({
  label,
  devices,
  band,
}: {
  label: string;
  devices: string;
  band: string;
}) {
  return (
    <div className="theme-panel-soft rounded-[1.3rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(251,251,253,0.44))] px-4 py-4 shadow-[0_14px_28px_rgba(201,204,214,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="flex items-center gap-2.5 text-[0.95rem] font-medium tracking-[-0.035em] text-ink-soft">
        <span className="flex h-8 w-8 items-center justify-center rounded-[0.85rem] bg-[#eef9f0] text-success">
          <Wifi size={16} strokeWidth={1.9} />
        </span>
        {label}
      </div>

      <div className="mt-3 space-y-1 text-[0.86rem] tracking-[-0.02em] text-ink-muted">
        <div>{devices}</div>
        <div>{band}</div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  label,
  icon: Icon,
  iconClassName,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] ${iconClassName}`}
      >
        <Icon size={17} strokeWidth={1.9} />
      </span>

      <span className="min-w-0 flex-1 text-[0.92rem] font-medium tracking-[-0.035em] text-ink-soft transition-colors duration-200 group-hover:text-ink">
        {label}
      </span>

      <ChevronRight
        size={17}
        strokeWidth={1.9}
        className="shrink-0 text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-muted"
      />
    </>
  );

  if (label === "Pay now") {
    return (
      <InteractiveHoverButtonLink
        href={href}
        className="theme-panel group flex items-center gap-3 rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,248,251,0.82))] px-3.5 py-3.5 shadow-[0_16px_32px_rgba(201,203,213,0.09),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl"
        containerClassName="rounded-[1.35rem]"
      >
        {content}
      </InteractiveHoverButtonLink>
    );
  }

  return (
    <Link
      href={href}
      className="theme-panel group flex items-center gap-3 rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,248,251,0.82))] px-3.5 py-3.5 shadow-[0_16px_32px_rgba(201,203,213,0.09),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(193,196,206,0.14),inset_0_1px_0_rgba(255,255,255,0.96)]"
    >
      {content}
    </Link>
  );
}

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-5.4rem-2rem)] lg:min-h-0 lg:gap-4 xl:h-[calc(100dvh-5.4rem-2.5rem)]">
      <section className="theme-panel relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,247,249,0.62))] px-4 py-4 shadow-[0_22px_48px_rgba(205,207,214,0.11),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:px-5 sm:py-5 lg:px-7 lg:py-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="theme-shell-orb-primary absolute left-[8%] top-5 h-36 w-36 rounded-full blur-3xl" />
          <div className="theme-shell-orb-secondary absolute bottom-6 left-[30%] h-14 w-36 rounded-full blur-3xl" />
        </div>

        <div className="relative grid items-center gap-5 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)] lg:gap-8">
          <div className="flex min-w-0 flex-col justify-center lg:pl-2">
            <div className="inline-flex max-w-full items-center gap-2.5 lg:gap-3">
              <StatusBeacon active />
              <span className="text-[1.35rem] font-medium tracking-[-0.05em] text-ink-soft">
                <TextReveal text="Active" />
              </span>
              <span className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(222,225,231,0.8),rgba(222,225,231,0))] lg:block" />
            </div>

            <div className="mt-4 text-[3.35rem] font-medium leading-[0.92] tracking-[-0.075em] text-ink sm:text-[4rem] xl:text-[4.3rem]">
              <NumberTicker value={110} prefix="$" decimals={2} />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-[0.86rem] text-ink-muted sm:text-[0.92rem]">
                Next billing
              </div>
              <div className="text-[1.75rem] font-medium tracking-[-0.055em] text-ink sm:text-[1.95rem]">
                Mar 17
              </div>
            </div>
          </div>

          <RouterStage />
        </div>
      </section>

      <section className="theme-panel-subtle relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,248,250,0.72))] px-4 py-4 shadow-[0_20px_44px_rgba(205,207,214,0.1),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:px-5 sm:py-5 lg:flex-1 lg:px-6 lg:py-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="theme-shell-orb-tertiary absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl" />
        </div>

        <div className="relative grid gap-4 xl:h-full xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.82fr)_16rem] xl:gap-6">
          <div className="space-y-4 xl:pr-1">
            <h2 className="text-[1.55rem] font-medium tracking-[-0.055em] text-ink">
              Gateway
            </h2>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {radios.map((radio) => (
                <NetworkCard key={radio.label} {...radio} />
              ))}
            </div>

            <div className="border-t border-line/40 pt-4">
              <div className="space-y-2.5">
                {payments.map((payment) => (
                  <div
                    key={payment.date}
                    className="flex items-baseline justify-between gap-4 text-[0.9rem] tracking-[-0.03em]"
                  >
                    <span className="text-ink-muted">{payment.date}</span>
                    <span className="text-[0.94rem] font-medium text-success">
                      {payment.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 xl:border-l xl:border-line/35 xl:pl-5">
            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Serial number</span>
              <span className="text-[0.9rem] font-medium tracking-[-0.03em] text-ink-soft">
                N/A
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Devices</span>
              <span className="text-[0.9rem] font-medium tracking-[-0.03em] text-ink-soft">
                0
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-b border-line/25 pb-2.5">
              <span className="text-[0.84rem] text-ink-muted">Status</span>
              <span className="text-[0.9rem] font-medium tracking-[-0.03em] text-success">
                Connected
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

          <div className="space-y-2.5 xl:border-l xl:border-line/35 xl:pl-5">
            {actions.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
