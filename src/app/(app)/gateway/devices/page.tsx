import { BadgeCheck, Laptop2, ShieldEllipsis, Smartphone } from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

const rows = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    band: "5 GHz",
    ip: "192.168.1.101",
    lastSeen: "Active now",
    trust: "Known",
  },
  {
    id: "macbook-pro",
    name: "MacBook Pro",
    band: "5 GHz",
    ip: "192.168.1.102",
    lastSeen: "2 min ago",
    trust: "Known",
  },
  {
    id: "smart-tv",
    name: "Living room TV",
    band: "5 GHz",
    ip: "192.168.1.115",
    lastSeen: "9 min ago",
    trust: "Trusted",
  },
  {
    id: "ring",
    name: "Doorbell",
    band: "2.4 GHz",
    ip: "192.168.1.126",
    lastSeen: "18 min ago",
    trust: "Needs review",
  },
];

export default function GatewayDevicesPage() {
  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Gateway"
        title="Connected devices"
        description="This route replaces the old card grid with a cleaner inventory view: scannable, filterable and closer to a modern SaaS operations table."
        actions={
          <>
            <StatusPill label="7 active devices" tone="success" />
            <button
              type="button"
              className="theme-control rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
            >
              Refresh list
            </button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="Trusted" value="5" meta="Persistent household devices" />
        <StatTile label="Needs review" value="1" meta="Recent connection change" />
        <StatTile label="Radio distribution" value="4 / 3" meta="5 GHz vs 2.4 GHz" />
      </div>

      <SurfacePanel className="p-4 lg:min-h-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All devices", "5 GHz", "2.4 GHz", "Trusted only"].map((filter, index) => (
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
            Search and live filters will plug into this surface next.
          </div>
        </div>

        <ProgressiveBlur className="mt-4" maxHeightClassName="max-h-[23rem]">
          <PremiumTable
            columns={[
              { key: "device", label: "Device" },
              { key: "band", label: "Band" },
              { key: "ip", label: "IP address" },
              { key: "last-seen", label: "Last seen" },
              { key: "status", label: "Trust", align: "right" },
            ]}
            rows={rows.map((row) => ({
              id: row.id,
              cells: [
                <div key={`${row.id}-device`} className="flex items-center gap-3">
                  <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-white/80 text-ink-soft">
                    {row.name.includes("iPhone") ? (
                      <Smartphone size={16} strokeWidth={1.8} />
                    ) : row.name.includes("MacBook") ? (
                      <Laptop2 size={16} strokeWidth={1.8} />
                    ) : (
                      <ShieldEllipsis size={16} strokeWidth={1.8} />
                    )}
                  </span>
                  <div>
                    <div className="font-medium text-ink">{row.name}</div>
                    <div className="text-label-md text-ink-muted">Known household device</div>
                  </div>
                </div>,
                row.band,
                row.ip,
                row.lastSeen,
                <div key={`${row.id}-trust`} className="flex justify-end">
                  <StatusPill
                    label={row.trust}
                    tone={row.trust === "Needs review" ? "warning" : "success"}
                  />
                </div>,
              ],
            }))}
          />
        </ProgressiveBlur>
      </SurfacePanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <SurfacePanel subtle className="p-4">
          <div className="text-title-md text-ink">Recommended detail drawer content</div>
          <div className="mt-3 text-body-sm text-ink-muted">
            Vendor, MAC, connection quality, last authorization, pause or block actions, plus a short audit trail. The route is structured so we can add that drawer without redesigning the page.
          </div>
        </SurfacePanel>

        <SurfacePanel subtle className="p-4">
          <div className="flex items-center gap-2 text-title-md text-ink">
            <BadgeCheck size={17} strokeWidth={1.8} />
            Trust model
          </div>
          <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
            <p>Known: remembered and approved.</p>
            <p>Trusted: persistent, safe and stable.</p>
            <p>Needs review: new behavior or unknown pattern.</p>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
