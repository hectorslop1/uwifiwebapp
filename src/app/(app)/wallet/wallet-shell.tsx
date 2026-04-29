"use client";

import { useState } from "react";
import { CreditCard, Plus, UserRoundPlus } from "lucide-react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { TextReveal } from "@/src/components/magic/text-reveal";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { AnimatedTooltip } from "@/src/components/ui/animated-tooltip";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import {
  affiliates,
  walletCards,
  walletHistory,
  walletSummary,
} from "@/src/lib/mock-portal-data";

type WalletView = "overview" | "cards" | "affiliates";

export function WalletShell() {
  const [view, setView] = useState<WalletView>("overview");

  const tierProgress = Math.round(
    (walletSummary.availablePoints / walletSummary.nextTierAt) * 100,
  );

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Wallet"
        title="U-Wallet"
        description="This module keeps the Flutter functionality intact: points, stored cards and affiliated users. The difference is structure and clarity, not feature loss."
        actions={
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "overview", label: "Overview" },
              { value: "cards", label: "Cards" },
              { value: "affiliates", label: "Affiliates" },
            ]}
          />
        }
      />

      {view === "overview" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
            <SurfacePanel className="p-5 sm:p-6">
              <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
                <TextReveal text="Available Points" />
              </div>
              <div className="mt-3 text-[3.2rem] font-medium tracking-[-0.08em] text-ink">
                <NumberTicker value={walletSummary.availablePoints} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <StatusPill
                  label={
                    <>
                      <NumberTicker
                        value={walletSummary.usdEquivalent}
                        prefix="$"
                        decimals={2}
                      />{" "}
                      usable value
                    </>
                  }
                  tone="success"
                />
                <span className="text-body-sm text-ink-muted">
                  Applied in checkout or future billing flows.
                </span>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-label-md text-ink-muted">
                  <span>{walletSummary.tier} tier</span>
                  <span>{tierProgress}% to next level</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/65">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(52,196,59,0.92),rgba(108,69,255,0.72))]"
                    style={{ width: `${Math.min(tierProgress, 100)}%` }}
                  />
                </div>
              </div>
            </SurfacePanel>

            <StatTile
              label="Points earned"
              value={walletSummary.pointsEarnedThisMonth}
              meta="This month"
            />
            <StatTile label="Stored cards" value={walletCards.length} meta="1 default method" />
            <StatTile label="Affiliates" value={affiliates.length} meta="1 invitation pending" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
            <SurfacePanel className="p-5 sm:p-6">
              <div className="text-title-md text-ink">Points activity</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                A lighter, more readable alternative to the old wallet dashboard chart.
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3">
                {walletHistory.map((entry) => (
                  <div key={entry.label} className="space-y-3">
                    <AnimatedTooltip
                      content={
                        <div className="flex flex-col items-center">
                          <div className="text-base font-bold text-white">
                            <NumberTicker value={entry.points} />
                          </div>
                          <div className="text-xs text-white/80">points</div>
                        </div>
                      }
                    >
                      <div className="flex h-44 items-end rounded-[1.25rem] bg-white/45 px-3 py-3">
                        <div
                          className="w-full rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(108,69,255,0.82),rgba(52,196,59,0.82))] transition-transform duration-300 hover:scale-[1.02]"
                          style={{ height: `${Math.max(18, entry.points)}px` }}
                        />
                      </div>
                    </AnimatedTooltip>
                    <div className="text-center text-label-md text-ink-muted">{entry.label}</div>
                    <div className="text-center text-body-sm font-medium text-ink">{entry.points}</div>
                  </div>
                ))}
              </div>
            </SurfacePanel>

            <SurfacePanel subtle className="p-5">
              <div className="text-title-md text-ink">Quick actions</div>
              <ActionCapsules className="mt-4">
                <ActionCapsule href="/store/checkout" label="Redeem points in checkout" />
                <ActionCapsule href="/billing/payment-methods" label="Review payment methods" />
                <ActionCapsule href="/billing" label="Check billing balance" />
              </ActionCapsules>
            </SurfacePanel>
          </div>
        </>
      ) : null}

      {view === "cards" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_18rem]">
          <div className="space-y-4">
            {walletCards.map((card) => (
              <SurfacePanel key={card.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/80 text-ink-soft">
                      <CreditCard size={19} strokeWidth={1.8} />
                    </span>
                    <div>
                      <div className="text-body-md font-medium text-ink">
                        {card.brand} ending in {card.last4}
                      </div>
                      <div className="text-body-sm text-ink-muted">Expires {card.expiry}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {card.isDefault ? <StatusPill label="Default" tone="success" /> : null}
                    <button
                      type="button"
                      className="rounded-pill border border-white/80 bg-white/65 px-4 py-2 text-body-sm text-ink-soft"
                    >
                      {card.isDefault ? "Edit" : "Set default"}
                    </button>
                  </div>
                </div>
              </SurfacePanel>
            ))}
          </div>

          <SurfacePanel subtle className="p-5">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <Plus size={17} strokeWidth={1.8} />
              Add card
            </div>
            <p className="mt-3 text-body-sm text-ink-muted">
              This keeps the card-management function from Flutter, but moves it into a quieter premium surface instead of decorative payment art.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
            >
              Launch add-card flow
            </button>
          </SurfacePanel>
        </div>
      ) : null}

      {view === "affiliates" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_18rem]">
          <div className="space-y-4">
            {affiliates.map((affiliate) => (
              <SurfacePanel key={affiliate.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7eea2f_0%,#07cf47_42%,#7b3cff_100%)] text-[1.1rem] font-medium text-white">
                      {affiliate.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div>
                      <div className="text-body-md font-medium text-ink">{affiliate.name}</div>
                      <div className="text-body-sm text-ink-muted">{affiliate.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill
                      label={affiliate.status}
                      tone={affiliate.status === "Pending" ? "warning" : "success"}
                    />
                    <span className="text-body-sm text-ink-muted">{affiliate.role}</span>
                  </div>
                </div>
              </SurfacePanel>
            ))}
          </div>

          <SurfacePanel subtle className="p-5">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <UserRoundPlus size={17} strokeWidth={1.8} />
              Invite affiliate
            </div>
            <p className="mt-3 text-body-sm text-ink-muted">
              Invite flows, role selection and resend behavior remain part of the product scope.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-pill border border-white/80 bg-white/60 px-4 py-3 text-body-sm text-ink-soft"
            >
              Start invite flow
            </button>
          </SurfacePanel>
        </div>
      ) : null}
    </div>
  );
}
