"use client";

import { useState } from "react";
import { Copy, Gift, QrCode, Share2 } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

function InviteFlash({
  message,
}: Readonly<{
  message: string;
}>) {
  return (
    <div className="rounded-[1.2rem] border border-[#d5eed2] bg-[rgba(242,251,241,0.92)] px-4 py-3 text-body-sm text-[#319c39] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
      {message}
    </div>
  );
}

export function InviteShell({
  referralCode,
  referralLink,
}: Readonly<{
  referralCode: string;
  referralLink: string;
}>) {
  const [flash, setFlash] = useState("");

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlash(`${label} copied to clipboard.`);
    } catch {
      setFlash(`Unable to copy the ${label.toLowerCase()} right now.`);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "U-WiFi invite",
          text: "Join U-WiFi using my referral link.",
          url: referralLink,
        });
        setFlash("Referral link shared successfully.");
        return;
      } catch {
        // Fall back to copy.
      }
    }

    await copyToClipboard(referralLink, "Referral link");
  };

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Invite"
        title="Invite friends"
        description="Share your referral link or code and help new customers join U-WiFi with a cleaner handoff."
      />

      {flash ? <InviteFlash message={flash} /> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_18rem]">
        <SurfacePanel className="overflow-hidden p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(106,2,197,0.12),transparent_74%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/60 px-3.5 py-2 text-body-sm text-ink-soft shadow-[0_12px_26px_rgba(200,203,213,0.08)]">
              <Gift size={16} strokeWidth={1.8} />
              Your U-WiFi referral
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-[#ece6ff] bg-[linear-gradient(135deg,rgba(116,85,255,0.12),rgba(56,205,113,0.08))] p-5">
              <div className="text-label-md uppercase tracking-[0.18em] text-ink-faint">
                Referral code
              </div>
              <div className="mt-3 text-[2.1rem] font-medium tracking-[-0.08em] text-ink">
                {referralCode}
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-white/85 bg-white/75 px-4 py-4">
                <div className="text-label-md uppercase tracking-[0.18em] text-ink-faint">
                  Referral link
                </div>
                <div className="mt-2 break-all text-body-sm text-ink-soft">
                  {referralLink}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard(referralCode, "Referral code")}
                  className="theme-control inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  <Copy size={15} strokeWidth={1.8} />
                  Copy code
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(referralLink, "Referral link")}
                  className="theme-control inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  <QrCode size={15} strokeWidth={1.8} />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={shareLink}
                  className="theme-cta inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium text-white"
                >
                  <Share2 size={15} strokeWidth={1.8} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel subtle className="p-4">
          <div className="text-title-md text-ink">How it works</div>
          <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
            <div>Share your link with someone who is ready to join U-WiFi.</div>
            <div>They can use the referral code if they prefer a shorter handoff.</div>
            <div>Keep the link handy when talking to friends, family or new customers.</div>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
