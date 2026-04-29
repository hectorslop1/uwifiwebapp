import Link from "next/link";
import {
  Activity,
  ChevronRight,
  Wifi,
} from "lucide-react";

import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { KeyValueList } from "@/src/components/ui/key-value-list";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

const networks = [
  { name: "U-WiFi 5G", devices: "4 active devices", band: "5 GHz", signal: "Excellent" },
  { name: "U-WiFi", devices: "3 active devices", band: "2.4 GHz", signal: "Stable" },
];

const gatewayMeta = [
  { label: "Serial number", value: "UDM-7H2-9LA" },
  { label: "Firmware", value: "v3.1.22" },
  { label: "Uptime", value: "14 days" },
  { label: "Status", value: "Connected", tone: "success" as const },
];

export default function GatewayPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Gateway"
        title="Gateway control center"
        description="A cleaner, more operational view of your network: connection health, radio status and the actions that matter most in one place."
        actions={
          <>
            <StatusPill label="Connected" tone="success" />
            <Link
              href="/gateway/wifi"
              className="rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
            >
              Adjust Wi-Fi
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Connection" value="99.98%" meta="Service health this month" />
        <StatTile label="Connected devices" value="7" meta="Across both radios" />
        <StatTile label="Latency profile" value="12 ms" meta="Low variability" />
        <StatTile label="Last restart" value="2 days" meta="No manual action needed" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_20rem]">
        <SurfacePanel className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-title-md text-ink">Radio summary</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                Keep the structure minimal: two radios, quick health read and direct actions.
              </div>
            </div>

            <button
              type="button"
              className="rounded-pill border border-white/80 bg-white/70 px-4 py-2 text-body-sm text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors duration-200 hover:text-ink"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {networks.map((network) => (
              <div
                key={network.name}
                className="rounded-[1.35rem] border border-white/75 bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
              >
                <div className="flex items-center gap-3 text-ink-soft">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-success-soft text-success">
                    <Wifi size={16} strokeWidth={1.9} />
                  </span>
                  <div>
                    <div className="text-body-md font-medium text-ink">{network.name}</div>
                    <div className="text-body-sm text-ink-muted">{network.devices}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-body-sm text-ink-muted">
                  <span>{network.band}</span>
                  <span>{network.signal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-line/30 bg-white/45 px-4 py-4">
            <div className="flex items-center gap-2 text-body-md text-ink">
              <Activity size={17} strokeWidth={1.8} />
              Recent network events
            </div>
            <div className="mt-4 space-y-3">
              {[
                "5 GHz radio stayed stable during the last 24 hours.",
                "No new devices required approval this week.",
                "Firmware sync completed successfully yesterday.",
              ].map((event) => (
                <div
                  key={event}
                  className="flex items-start gap-3 border-b border-line/20 pb-3 text-body-sm text-ink-muted last:border-b-0 last:pb-0"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success" />
                  <span>{event}</span>
                </div>
              ))}
            </div>
          </div>
        </SurfacePanel>

        <div className="space-y-5">
          <SurfacePanel subtle className="p-5">
            <div className="text-title-md text-ink">Gateway details</div>
            <div className="mt-4">
              <KeyValueList items={gatewayMeta} />
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-5">
            <div className="text-title-md text-ink">Primary actions</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/gateway/devices" label="Inspect devices" />
              <ActionCapsule href="/gateway/wifi" label="Update Wi-Fi credentials" />
              <ActionCapsule href="/billing" label="Review account status" />
            </ActionCapsules>
          </SurfacePanel>

          <Link
            href="/gateway/devices"
            className="inline-flex items-center gap-1.5 px-1 text-body-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Open the connected devices inventory
            <ChevronRight size={15} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </div>
  );
}
