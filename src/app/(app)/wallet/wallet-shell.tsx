"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  CreditCard,
  MoreHorizontal,
  Plus,
  Share2,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { PREMIUM_EASE } from "@/src/components/magic/motion-tokens";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { AnimatedTooltip } from "@/src/components/ui/animated-tooltip";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import type { WalletDashboardData } from "@/src/server/wallet/types";
import { cn } from "@/src/lib/cn";
import { UWALLET_MILESTONES } from "@/src/lib/wallet-milestones";

import { sendAffiliateInvitationAction } from "./actions";
import { initialAffiliateInviteActionState } from "./wallet-action-state";

const actions = [
  {
    href: "/billing",
    label: "Pay now",
    icon: CreditCard,
    iconClassName:
      "border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(246,252,246,0.98),rgba(235,247,236,0.92))] text-[#4ba64d] shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
  {
    href: "/billing/invoices",
    label: "View invoices",
    icon: BarChart3,
    iconClassName:
      "border border-[#e3def5] bg-[linear-gradient(180deg,rgba(247,244,255,0.98),rgba(238,235,252,0.92))] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
  {
    href: "/billing/payment-methods",
    label: "Manage cards",
    icon: WalletCards,
    iconClassName:
      "border border-[#dfe9de] bg-[linear-gradient(180deg,rgba(246,252,246,0.98),rgba(235,247,236,0.92))] text-[#4ba64d] shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
  {
    href: "/invite",
    label: "Invite friends",
    icon: Share2,
    iconClassName:
      "border border-[#e3def5] bg-[linear-gradient(180deg,rgba(247,244,255,0.98),rgba(238,235,252,0.92))] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]",
  },
] as const;

const panelClassName =
  "relative overflow-hidden rounded-[2rem] border border-[#ebe7de] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,251,248,0.9))] shadow-[0_20px_60px_rgba(220,214,203,0.25),inset_0_1px_0_rgba(255,255,255,0.96)]";

function formatPoints(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCardBrandLabel(brand: string, last4Digits: string) {
  if (!last4Digits) {
    return brand || "Card";
  }

  return `${brand || "Card"} ••${last4Digits}`;
}

function formatUserInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  if (parts[0]?.length) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "UW";
}

const walletMilestones = UWALLET_MILESTONES;

function getMilestoneProgress(currentValue: number) {
  const clampedValue = Math.max(0, currentValue);
  const maxValue = walletMilestones[walletMilestones.length - 1] ?? 49.95;
  const achievedCount = walletMilestones.filter(
    (milestone) => clampedValue >= milestone,
  ).length;
  const activeIndex = Math.min(achievedCount, walletMilestones.length - 1);

  if (clampedValue >= maxValue) {
    return {
      activeIndex: walletMilestones.length - 1,
      progressPercent: 100,
      achievedCount,
    };
  }

  const previousValue = achievedCount > 0 ? walletMilestones[achievedCount - 1] ?? 0 : 0;
  const nextValue = walletMilestones[activeIndex] ?? maxValue;
  const segmentProgress =
    nextValue > previousValue
      ? (clampedValue - previousValue) / (nextValue - previousValue)
      : 1;
  const progressPercent =
    ((activeIndex + Math.max(0, Math.min(segmentProgress, 1))) /
      (walletMilestones.length - 1)) *
    100;

  return {
    activeIndex,
    progressPercent,
    achievedCount,
  };
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
      className="wallet-outline-action inline-flex items-center gap-2 rounded-full border border-[#63c65d] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,252,240,0.94))] px-5 py-2.5 text-[0.94rem] font-medium text-[#2f9837] shadow-[0_14px_28px_rgba(177,215,172,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4fbb4f] hover:bg-[linear-gradient(180deg,rgba(248,255,247,1),rgba(232,249,230,0.96))]"
    >
      <Plus size={16} strokeWidth={1.9} />
      {label}
    </Link>
  );
}

function InviteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="wallet-outline-action inline-flex min-h-[2.85rem] items-center justify-center gap-2 rounded-[0.9rem] border border-[#55bd54] bg-[#55bd54] px-4 text-[0.92rem] font-medium text-white transition-colors duration-200 hover:bg-[#49b948] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Sending invitation..." : "Send invitation"}
    </button>
  );
}

export function WalletShell({
  dashboard,
  currentUser,
}: Readonly<{
  dashboard: WalletDashboardData;
  currentUser: {
    customerId: number;
    fullName: string;
  };
}>) {
  const [cardMenuOpen, setCardMenuOpen] = useState(false);
  const [chartView, setChartView] = useState<"weekly" | "monthly">("monthly");
  const [affiliatePanelOpen, setAffiliatePanelOpen] = useState(false);
  const cardMenuRef = useRef<HTMLDivElement | null>(null);
  const [inviteState, inviteFormAction] = useActionState(
    sendAffiliateInvitationAction,
    initialAffiliateInviteActionState,
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!cardMenuRef.current?.contains(event.target as Node)) {
        setCardMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const activeHistory =
    chartView === "weekly" ? dashboard.weeklyHistory : dashboard.monthlyHistory;
  const maxHistoryPoints = Math.max(
    ...activeHistory.map((entry) => entry.points),
    1,
  );
  const totalPoints = dashboard.points.totalPoints;
  const totalDollarValue = dashboard.points.totalDollars;
  const principalPoints = dashboard.points.principalPoints;
  const affiliatePoints = dashboard.points.affiliatePoints;
  const paymentMethodsCount = dashboard.paymentMethods.length;
  const primaryCard = dashboard.paymentMethods[0] ?? null;
  const milestoneProgress = useMemo(
    () => getMilestoneProgress(totalDollarValue),
    [totalDollarValue],
  );
  const affiliateUsers = useMemo(() => {
    const hasCurrentUser = dashboard.affiliatedUsers.some(
      (user) => user.customerId === currentUser.customerId,
    );

    if (hasCurrentUser) {
      return dashboard.affiliatedUsers;
    }

    return [
      {
        customerId: currentUser.customerId,
        customerName: currentUser.fullName,
        isAffiliate: false,
        initials: formatUserInitials(currentUser.fullName),
      },
      ...dashboard.affiliatedUsers,
    ];
  }, [currentUser.customerId, currentUser.fullName, dashboard.affiliatedUsers]);

  const principalPercentage =
    totalPoints > 0 ? Math.round((principalPoints / totalPoints) * 100) : 0;
  const affiliatePercentage =
    totalPoints > 0 ? Math.round((affiliatePoints / totalPoints) * 100) : 0;

  return (
    <div className="wallet-dashboard space-y-3 pb-2">
      <PageIntro
        title="U-Wallet"
        description="Manage your points, payment methods, and affiliated users."
        className="pt-0.5"
      />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.03fr)_minmax(18rem,0.97fr)]">
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
              My accumulated U-Points
            </div>

            <div className="mt-2 text-[0.86rem] leading-6 text-[#6a706d]">
              Milestones show the dollar value you have unlocked toward your next reward level.
            </div>

            <div className="relative mt-4 px-2 sm:px-4">
              <div className="absolute left-[9%] right-[9%] top-[1rem] h-[3px] rounded-full bg-[#dfe9da]" />
              <motion.div
                className="absolute left-[9%] top-[1rem] h-[3px] rounded-full bg-[linear-gradient(90deg,#56c34d_0%,#6A02C5_100%)] shadow-[0_10px_24px_rgba(95,185,89,0.22)]"
                initial={false}
                animate={{
                  width: `${82 * (milestoneProgress.progressPercent / 100)}%`,
                }}
                transition={{ duration: 0.7, ease: PREMIUM_EASE }}
              />

              <div className="relative grid grid-cols-6 gap-2 sm:gap-3">
                {walletMilestones.map((milestone, index) => {
                  const achieved = totalDollarValue >= milestone;
                  const active = index === milestoneProgress.activeIndex;

                  return (
                    <div key={milestone} className="flex flex-col items-center gap-2">
                      <motion.span
                        className={cn(
                          "flex items-center justify-center rounded-full border text-white",
                          achieved
                            ? "border-[#02BD30] bg-[#02BD30] shadow-[0_12px_24px_rgba(2,189,48,0.24)]"
                            : active
                              ? "border-[#6A02C5] bg-white text-[#6A02C5] shadow-[0_16px_34px_rgba(106,2,197,0.18)]"
                              : "border-[#d9ded6] bg-white text-[#c2c9bf]",
                        )}
                        animate={
                          active
                            ? {
                                scale: [1, 1.06, 1],
                                boxShadow: [
                                  "0 12px 28px rgba(106,2,197,0.14)",
                                  "0 18px 38px rgba(106,2,197,0.22)",
                                  "0 12px 28px rgba(106,2,197,0.14)",
                                ],
                              }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: 2.6,
                          repeat: active ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                        style={{
                          width: active ? "2.35rem" : "1.85rem",
                          height: active ? "2.35rem" : "1.85rem",
                          borderWidth: active ? 2.5 : 2,
                        }}
                      >
                        {achieved ? (
                          <Check size={active ? 15 : 13} strokeWidth={2.8} />
                        ) : (
                          <span className="block h-2.5 w-2.5 rounded-full bg-current/70" />
                        )}
                      </motion.span>
                      <span
                        title={`Reward milestone at $${milestone}`}
                        className={cn(
                          "text-[0.8rem] font-medium",
                          achieved
                            ? "text-[#3cb145]"
                            : active
                              ? "text-[#6d58f1]"
                              : "text-[#8a928d]",
                        )}
                      >
                        ${milestone}
                      </span>
                    </div>
                  );
                })}
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
                <div className="wallet-faint-text w-10 text-right text-[0.86rem] text-[#808788]">
                  {principalPercentage}%
                </div>
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
                <div className="wallet-faint-text w-10 text-right text-[0.86rem] text-[#808788]">
                  {affiliatePercentage}%
                </div>
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

          {primaryCard ? (
            <div className="mt-4">
              <div className="flex w-full justify-center">
                <div className="flex w-full max-w-[23.75rem] items-start justify-center gap-3 sm:gap-4">
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
                            {primaryCard.cardBrand || "Credit Card"}
                          </div>
                          {primaryCard.isDefault ? (
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
                          **** **** **** {primaryCard.last4Digits}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-3 text-white">
                          <div>
                            <div className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-white/80">
                              Card Holder
                            </div>
                            <div className="mt-1 text-[0.84rem] font-semibold uppercase tracking-[-0.02em]">
                              {primaryCard.cardHolder}
                            </div>
                          </div>

                          <div className="justify-self-end text-right">
                            <div className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-white/80">
                              Expires
                            </div>
                            <div className="mt-1 text-[0.84rem] font-semibold tracking-[-0.02em]">
                              {primaryCard.expirationMonth || "--"}/{primaryCard.expirationYear || "--"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="wallet-card-glow mx-auto -mt-1 h-6 w-[82%] rounded-full bg-[radial-gradient(circle,rgba(121,232,166,0.28)_0%,rgba(123,90,255,0.22)_38%,rgba(255,255,255,0)_72%)] blur-2xl" />
                  </div>

                  <div ref={cardMenuRef} className="relative shrink-0 pt-3">
                    <button
                      type="button"
                      aria-label="More card actions"
                      aria-expanded={cardMenuOpen}
                      onClick={() => setCardMenuOpen((current) => !current)}
                      className="wallet-icon-button flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.92))] text-[#5a6672] shadow-[0_14px_28px_rgba(205,210,217,0.18),inset_0_1px_0_rgba(255,255,255,0.98)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cdd8dc] hover:text-ink"
                    >
                      <MoreHorizontal size={18} strokeWidth={2.1} />
                    </button>

                    {cardMenuOpen ? (
                      <div className="wallet-menu-panel absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[12rem] rounded-[1rem] border border-[#ebe6dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,248,245,0.95))] p-2 shadow-[0_18px_38px_rgba(214,207,196,0.28)] backdrop-blur-xl">
                        <div className="px-3 py-2 text-[0.84rem] text-[#6f7578]">
                          {formatCardBrandLabel(primaryCard.cardBrand, primaryCard.last4Digits)}
                        </div>
                        <Link
                          href="/billing/payment-methods"
                          className="flex w-full items-center rounded-[0.8rem] px-3 py-2.5 text-left text-[0.95rem] font-medium text-[#343a40] transition-colors duration-200 hover:bg-[#f2fbef] hover:text-[#41b044]"
                        >
                          Manage cards
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[1.25rem] border border-[#efe9df] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,247,244,0.88))] px-4 py-4 text-[0.95rem] text-[#5d645f]">
              No payment methods are saved yet. Add your first card to use it across billing and checkout.
            </div>
          )}
        </section>

        <section className={cn(panelClassName, "wallet-panel p-4 sm:p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SectionIcon tone="soft">
                <BarChart3 size={18} strokeWidth={2.1} />
              </SectionIcon>
              <div>
                <h2 className="wallet-strong-text text-[1.02rem] font-medium tracking-[-0.03em] text-[#1f2428]">
                  Points History
                </h2>
                <div className="mt-1 text-[0.84rem] text-[#6a706d]">Points earned</div>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <SegmentedControl
                value={chartView}
                onChange={setChartView}
                className="wallet-segment"
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </div>
          </div>

          <div
            className="mt-5 grid gap-2.5"
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
                  <div className="wallet-chart-track flex h-28 items-end rounded-[1rem] bg-[#f7f7f3] px-2 py-2">
                    <motion.div
                      className="w-full rounded-[0.75rem] bg-[linear-gradient(180deg,rgba(106,2,197,0.82),rgba(2,189,48,0.82))] shadow-[0_12px_26px_rgba(103,101,193,0.16)] transition-transform duration-300 hover:scale-[1.02]"
                      initial={{ height: 0, opacity: 0.6 }}
                      animate={{
                        height: Math.max(
                          18,
                          Math.min(96, (entry.points / maxHistoryPoints) * 96),
                        ),
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
              onClick={() => setAffiliatePanelOpen((current) => !current)}
              className="wallet-outline-action inline-flex min-h-[2.65rem] items-center justify-center gap-2 rounded-[0.75rem] border border-[#55bd54] bg-white/72 px-4 text-[0.9rem] font-medium text-[#47b44a] transition-colors duration-200 hover:bg-[#f6fff5]"
            >
              {affiliatePanelOpen ? <X size={17} strokeWidth={1.9} /> : <Plus size={17} strokeWidth={1.9} />}
              {affiliatePanelOpen ? "Close" : "Add Affiliate"}
            </button>
          </div>

          {inviteState.status !== "idle" && inviteState.message ? (
            <div
              className={`mt-4 rounded-[1rem] border px-4 py-3 text-[0.9rem] ${
                inviteState.status === "success"
                  ? "border-[#d7ebd8] bg-[#f5fff5] text-[#2f7c39]"
                  : "border-[#f2d8d4] bg-[#fff7f5] text-[#b05749]"
              }`}
            >
              {inviteState.message}
            </div>
          ) : null}

          {affiliatePanelOpen ? (
            <form
              action={inviteFormAction}
              className="mt-4 rounded-[1.3rem] border border-[#efe9df] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,247,244,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[0.82rem] font-medium text-[#5d645f]">First name</span>
                  <input
                    name="firstName"
                    className="theme-input w-full rounded-[0.95rem] border border-white/90 bg-white/80 px-4 py-3 text-[0.92rem] text-ink outline-none"
                    placeholder="Name"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[0.82rem] font-medium text-[#5d645f]">Last name</span>
                  <input
                    name="lastName"
                    className="theme-input w-full rounded-[0.95rem] border border-white/90 bg-white/80 px-4 py-3 text-[0.92rem] text-ink outline-none"
                    placeholder="Last name"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[0.82rem] font-medium text-[#5d645f]">Email</span>
                  <input
                    name="email"
                    type="email"
                    className="theme-input w-full rounded-[0.95rem] border border-white/90 bg-white/80 px-4 py-3 text-[0.92rem] text-ink outline-none"
                    placeholder="Email address"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[0.82rem] font-medium text-[#5d645f]">Phone</span>
                  <input
                    name="phone"
                    className="theme-input w-full rounded-[0.95rem] border border-white/90 bg-white/80 px-4 py-3 text-[0.92rem] text-ink outline-none"
                    placeholder="Phone number"
                  />
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <InviteSubmitButton />
              </div>
            </form>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {affiliateUsers.map((user) => (
              <div
                key={user.customerId}
                className="wallet-affiliate-card rounded-[1.2rem] border border-[#efebe2] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,248,245,0.9))] px-4 py-3 shadow-[0_12px_28px_rgba(222,215,205,0.16)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#02BD30] text-[0.96rem] font-semibold text-white">
                    {user.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="wallet-strong-text text-[0.98rem] font-medium tracking-[-0.02em] text-[#31363b]">
                      {user.customerName}
                    </div>
                  </div>

                  <span
                    className={`wallet-affiliate-pill rounded-full px-3 py-1 text-[0.85rem] font-medium ${
                      user.isAffiliate
                        ? "bg-[#f5efff] text-[#8b57ff]"
                        : "bg-[#f0f8ea] text-[#67bf5e]"
                    }`}
                  >
                    {user.isAffiliate ? "Affiliate" : "You"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-line/25 pt-4">
            <ActionCapsules className="grid gap-3 sm:grid-cols-2">
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
    </div>
  );
}
