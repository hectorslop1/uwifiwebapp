import { WifiHigh } from "lucide-react";

import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

function NetworkSettingsCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <SurfacePanel subtle className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-success-soft text-success">
          <WifiHigh size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className="text-title-md text-ink">{title}</div>
          <div className="text-body-sm text-ink-muted">{subtitle}</div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {[
          ["SSID", title],
          ["Password", "••••••••••••"],
          ["Security", "WPA2 / WPA3 mixed"],
          ["Channel strategy", "Automatic"],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1">
            <div className="text-label-md text-ink-muted">{label}</div>
            <div className="rounded-[1rem] border border-white/80 bg-white/70 px-4 py-3 text-body-sm text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              {value}
            </div>
          </div>
        ))}
      </div>
    </SurfacePanel>
  );
}

export default function GatewayWifiPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Gateway"
        title="Wi-Fi settings"
        description="This page sets the tone for forms in the portal: fewer boxes, stronger spacing, clear state hierarchy and a save model that feels premium instead of technical."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_20rem]">
        <div className="grid gap-5 lg:grid-cols-2">
          <NetworkSettingsCard title="U-WiFi 5G" subtitle="Primary high-band radio" />
          <NetworkSettingsCard title="U-WiFi" subtitle="Coverage-focused radio" />
        </div>

        <div className="space-y-5">
          <SurfacePanel subtle className="p-5">
            <div className="text-title-md text-ink">Apply changes</div>
            <div className="mt-3 text-body-sm text-ink-muted">
              On the final interactive pass, this panel becomes a sticky save surface with validation, pending state and restart confirmation.
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                className="rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
              >
                Save network updates
              </button>
              <button
                type="button"
                className="rounded-pill border border-white/80 bg-white/60 px-4 py-3 text-body-sm text-ink-soft"
              >
                Restart gateway
              </button>
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-5">
            <div className="text-title-md text-ink">Related actions</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/gateway/devices" label="Review connected devices" />
              <ActionCapsule href="/billing/payment-methods" label="Confirm autopay method" />
              <ActionCapsule href="/overview" label="Back to account overview" />
            </ActionCapsules>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
