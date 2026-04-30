"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  CreditCard,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { PREMIUM_EASE } from "@/src/components/magic/motion-tokens";
import { AnimatedTooltip } from "@/src/components/ui/animated-tooltip";
import { PageIntro } from "@/src/components/ui/page-intro";
import { cn } from "@/src/lib/cn";
import { walletHistory } from "@/src/lib/mock-portal-data";

const totalPoints = 39590;
const affiliatePoints = 0;
const principalPoints = totalPoints - affiliatePoints;
const paymentMethodsCount = 1;

const pointsMilestones = ["$10", "$20", "$30", "$30", "$55"];
const weeklyHistory = [
  { label: "Mon", points: 28 },
  { label: "Tue", points: 44 },
  { label: "Wed", points: 31 },
  { label: "Thu", points: 52 },
  { label: "Fri", points: 38 },
  { label: "Sat", points: 22 },
  { label: "Sun", points: 47 },
];

const cardDetails = {
  label: "Credit Card",
  last4: "4000",
  holder: "Donald Workman",
  expiry: "11/32",
  isDefault: true,
};

const affiliateUser = {
  initials: "DW",
  name: "Donald Workman",
};

const panelClassName =
  "relative overflow-hidden rounded-[2rem] border border-[#ebe7de] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,251,248,0.9))] shadow-[0_20px_60px_rgba(220,214,203,0.25),inset_0_1px_0_rgba(255,255,255,0.96)]";

function formatPoints(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function SectionIcon({
  children,
  tone = "green",
}: Readonly<{
  children: React.ReactNode;
  tone?: "green" | "soft";
}>) {
  return (
    <span
      className={cn(
        "wallet-section-icon flex h-10 w-10 items-center justify-center rounded-[0.95rem]",
        tone === "green"
          ? "wallet-section-icon-green bg-[linear-gradient(180deg,#78dc60_0%,#6bcf54_100%)] text-white shadow-[0_18px_35px_rgba(109,201,89,0.32)]"
          : "wallet-section-icon-soft border border-white/90 bg-[#f4faf3] text-[#42b53f]",
      )}
    >
      {children}
    </span>
  );
}

function OutlineAction({
  href,
  label,
}: Readonly<{
  href: string;
  label: string;
}>) {
  return (
    <Link
      href={href}
      className="wallet-outline-action inline-flex items-center gap-2 rounded-full border border-[#55bd54] bg-white/70 px-5 py-2.5 text-[0.94rem] font-medium text-[#47b44a] transition-colors duration-200 hover:bg-[#f6fff5]"
    >
      <Plus size={16} strokeWidth={1.9} />
      {label}
    </Link>
  );
}

export function WalletShell() {
  const [cardMenuOpen, setCardMenuOpen] = useState(false);
  const [chartView, setChartView] = useState<"weekly" | "monthly">("monthly");
  const cardMenuRef = useRef<HTMLDivElement | null>(null);
  const activeHistory = chartView === "weekly" ? weeklyHistory : walletHistory;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!cardMenuRef.current?.contains(event.target as Node)) {
        setCardMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="wallet-dashboard space-y-3 xl:space-y-4">
      <PageIntro
        title="U-Wallet"
        description="Manage your points, payment methods, and affiliated users."
        className="pt-0.5"
      />

      <div className="grid gap-3 lg:[zoom:0.78] xl:grid-cols-[minmax(0,1.03fr)_minmax(19rem,0.97fr)] 2xl:[zoom:1]">
        <section className={cn(panelClassName, "wallet-panel p-4 sm:p-5")}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-5rem] top-[-4rem] h-44 w-44 rounded-full bg-[#edf7ea] blur-3xl" />
            <div className="absolute left-8 top-10 h-20 w-20 rounded-full bg-[#fbf8ef] blur-2xl" />
          </div>

          <div className="relative">
            <div className="space-y-0.5">
              <div className="wallet-subtle-text text-[0.95rem] font-medium tracking-[-0.02em] text-[#5d645f]">
                Total points
              </div>
              <div className="text-[clamp(1.85rem,3.6vw,2.7rem)] font-medium leading-none tracking-[-0.06em] text-[#44b247]">
                <NumberTicker value={totalPoints} />
              </div>
            </div>

            <div className="wallet-strong-text mt-4 text-[0.96rem] font-medium tracking-[-0.03em] text-[#1f2428]">
              My Accumulated U-Points
            </div>

            <div className="relative mt-4 px-2 sm:px-4">
              <div className="wallet-progress-line absolute left-[11%] right-[11%] top-[0.8rem] h-[2px] rounded-full bg-[#55c651]" />

              <div className="relative grid grid-cols-5 gap-3">
                {pointsMilestones.map((milestone, index) => (
                  <div key={`${milestone}-${index}`} className="flex flex-col items-center gap-2.5">
                    <span className="wallet-progress-check flex h-7 w-7 items-center justify-center rounded-full bg-[#4abd47] text-white shadow-[0_10px_20px_rgba(91,201,82,0.26)]">
                      <Check size={14} strokeWidth={2.8} />
                    </span>
                    <span className="wallet-progress-label text-[0.82rem] font-medium text-[#3cb145]">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wallet-breakdown mt-4 rounded-[1.2rem] border border-[#efe9df] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,247,244,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
              <div className="wallet-breakdown-row flex items-center gap-3 border-b border-[#ede8de] pb-3">
                <span className="wallet-breakdown-icon flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-[#f2f8ef] text-[#4ab54a]">
                  <Users size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="wallet-subtle-text text-[0.9rem] text-[#535a5d]">Principal points</div>
                </div>
                <div className="wallet-strong-text text-[0.94rem] font-medium text-[#1f2428]">
                  {formatPoints(principalPoints)}
                </div>
                <div className="wallet-faint-text w-10 text-right text-[0.86rem] text-[#808788]">100%</div>
              </div>

              <div className="wallet-breakdown-row flex items-center gap-3 pt-3">
                <span className="wallet-breakdown-icon wallet-breakdown-icon-secondary flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-[#f4efff] text-[#8b57ff]">
                  <Users size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="wallet-subtle-text text-[0.9rem] text-[#535a5d]">Affiliate points</div>
                </div>
                <div className="wallet-strong-text text-[0.94rem] font-medium text-[#1f2428]">
                  {formatPoints(affiliatePoints)}
                </div>
                <div className="wallet-faint-text w-10 text-right text-[0.86rem] text-[#808788]">0%</div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(panelClassName, "wallet-panel p-4 sm:p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CreditCard size={18} strokeWidth={1.9} className="wallet-icon-muted text-[#5b6470]" />
              <h2 className="wallet-strong-text text-[1.02rem] font-medium tracking-[-0.03em] text-[#1f2428]">
                Payment Methods ({paymentMethodsCount})
              </h2>
            </div>

            <OutlineAction href="/billing/payment-methods" label="Add Card" />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex w-full justify-center md:justify-center">
              <div className="w-full max-w-[20rem]">
                <div className="relative aspect-[1.58] overflow-hidden rounded-[1.6rem] shadow-[0_24px_46px_rgba(97,80,170,0.18)]">
                  <Image
                    src="/images/CreditCardUI.png"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 352px"
                    className="object-cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,16,29,0.02),rgba(6,8,22,0.16))]" />

                  <div className="absolute inset-0 flex flex-col p-3.5 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-[0.92rem] font-semibold uppercase tracking-[-0.02em]">
                        {cardDetails.label}
                      </div>
                      {cardDetails.isDefault ? (
                        <span className="rounded-[0.55rem] bg-white/92 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.04em] text-[#53b947]">
                          Default
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5">
                      <Image
                        src="/images/silverchip.png"
                        alt="Card chip"
                        width={37}
                        height={28}
                        className="object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.12)]"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>

                    <div className="mt-2.5 text-[1.02rem] tracking-[0.12em] text-white/96">
                      **** **** **** {cardDetails.last4}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-3 text-white">
                      <div>
                        <div className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-white/80">
                          Card Holder
                        </div>
                        <div className="mt-1 text-[0.84rem] font-semibold uppercase tracking-[-0.02em]">
                          {cardDetails.holder}
                        </div>
                      </div>

                      <div className="justify-self-end text-right">
                        <div className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-white/80">
                          Expires
                        </div>
                        <div className="mt-1 text-[0.84rem] font-semibold tracking-[-0.02em]">
                          {cardDetails.expiry}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wallet-card-glow mx-auto -mt-1 h-6 w-[82%] rounded-full bg-[radial-gradient(circle,rgba(121,232,166,0.28)_0%,rgba(123,90,255,0.22)_38%,rgba(255,255,255,0)_72%)] blur-2xl" />
              </div>
            </div>

            <div ref={cardMenuRef} className="relative shrink-0 self-start md:self-center">
              <button
                type="button"
                aria-label="More card actions"
                aria-expanded={cardMenuOpen}
                onClick={() => setCardMenuOpen((current) => !current)}
                className="wallet-icon-button flex h-11 w-11 items-center justify-center rounded-full border border-[#efebe4] bg-white/90 text-[#2b3036] shadow-[0_10px_22px_rgba(221,215,205,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <MoreHorizontal size={20} strokeWidth={2.2} />
              </button>

              {cardMenuOpen ? (
                <div className="wallet-menu-panel absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[12rem] rounded-[1rem] border border-[#ebe6dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,248,245,0.95))] p-2 shadow-[0_18px_38px_rgba(214,207,196,0.28)] backdrop-blur-xl">
                  {!cardDetails.isDefault ? (
                    <button
                      type="button"
                      className="flex w-full items-center rounded-[0.8rem] px-3 py-2.5 text-left text-[0.95rem] font-medium text-[#343a40] transition-colors duration-200 hover:bg-[#f2fbef] hover:text-[#41b044]"
                    >
                      Set as default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="flex w-full items-center rounded-[0.8rem] px-3 py-2.5 text-left text-[0.95rem] font-medium text-[#d45858] transition-colors duration-200 hover:bg-[#fff2f2]"
                  >
                    Delete Card
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className={cn(panelClassName, "wallet-panel p-4 sm:p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SectionIcon tone="soft">
                <BarChart3 size={18} strokeWidth={2.1} />
              </SectionIcon>
              <h2 className="wallet-strong-text text-[1.02rem] font-medium tracking-[-0.03em] text-[#1f2428]">
                Points History
              </h2>
            </div>

            <div className="wallet-segment inline-flex rounded-[0.9rem] border border-[#e8e4da] bg-[#fbfbf8] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <button
                type="button"
                onClick={() => setChartView("weekly")}
                className={cn(
                  "wallet-segment-button rounded-[0.75rem] px-5 py-2 text-[0.94rem] font-medium transition-colors duration-200",
                  chartView === "weekly"
                    ? "wallet-segment-button-active border border-[#55bd54] bg-white text-[#47b44a]"
                    : "text-[#6e7478]",
                )}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setChartView("monthly")}
                className={cn(
                  "wallet-segment-button rounded-[0.75rem] px-5 py-2 text-[0.94rem] font-medium transition-colors duration-200",
                  chartView === "monthly"
                    ? "wallet-segment-button-active border border-[#55bd54] bg-white text-[#47b44a]"
                    : "text-[#6e7478]",
                )}
              >
                Monthly
              </button>
            </div>
          </div>

          <div
            className="mt-6 grid gap-2.5"
            style={{ gridTemplateColumns: `repeat(${activeHistory.length}, minmax(0, 1fr))` }}
          >
            {activeHistory.map((entry, index) => (
              <div key={`${chartView}-${entry.label}`} className="space-y-2">
                <AnimatedTooltip
                  content={
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-white">
                        <NumberTicker value={entry.points} />
                      </div>
                      <div className="text-xs text-white/80">points</div>
                    </div>
                  }
                  contentClassName="rounded-[0.95rem] bg-[#23272b] px-3 py-2 text-white shadow-[0_18px_36px_rgba(0,0,0,0.28)]"
                >
                  <div className="wallet-chart-track flex h-36 items-end rounded-[1rem] bg-[#f7f7f3] px-2.5 py-2.5">
                    <motion.div
                      className="w-full rounded-[0.75rem] bg-[linear-gradient(180deg,rgba(108,69,255,0.82),rgba(52,196,59,0.82))] shadow-[0_12px_26px_rgba(103,101,193,0.16)] transition-transform duration-300 hover:scale-[1.02]"
                      initial={{ height: 0, opacity: 0.6 }}
                      animate={{
                        height: Math.max(18, entry.points * (chartView === "weekly" ? 1.7 : 0.95)),
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.75,
                        delay: index * 0.08,
                        ease: PREMIUM_EASE,
                      }}
                    />
                  </div>
                </AnimatedTooltip>
                <div className="wallet-faint-text text-center text-[0.8rem] text-[#7c8388]">{entry.label}</div>
                <div className="wallet-strong-text text-center text-[0.86rem] font-medium text-[#1f2428]">
                  {entry.points}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cn(panelClassName, "wallet-panel p-4 sm:p-5")}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users size={18} strokeWidth={1.9} className="wallet-icon-muted text-[#5b6470]" />
              <h2 className="wallet-strong-text text-[1.02rem] font-medium tracking-[-0.03em] text-[#1f2428]">
                Me and my affiliated users
              </h2>
            </div>

            <button
              type="button"
              className="wallet-outline-action inline-flex min-h-[2.65rem] items-center justify-center gap-2 rounded-[0.75rem] border border-[#55bd54] bg-white/72 px-4 text-[0.9rem] font-medium text-[#47b44a] transition-colors duration-200 hover:bg-[#f6fff5]"
            >
              <Plus size={17} strokeWidth={1.9} />
              Add Affiliate
            </button>
          </div>

          <div className="wallet-affiliate-card mt-4 w-full max-w-[18.75rem] rounded-[1.2rem] border border-[#efebe2] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,248,245,0.9))] px-4 py-3 shadow-[0_12px_28px_rgba(222,215,205,0.16)]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4abd47] text-[0.96rem] font-semibold text-white">
                {affiliateUser.initials}
              </span>

              <div className="min-w-0 flex-1">
                <div className="wallet-strong-text text-[0.98rem] font-medium tracking-[-0.02em] text-[#31363b]">
                  {affiliateUser.name}
                </div>
              </div>

              <span className="wallet-affiliate-pill rounded-full bg-[#f0f8ea] px-3 py-1 text-[0.85rem] font-medium text-[#67bf5e]">
                You
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
