import { Laptop2, Radio, ShieldEllipsis, Smartphone } from "lucide-react";

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
    deviceType: "Personal phone",
    connection: "Excellent",
  },
  {
    id: "macbook-pro",
    name: "MacBook Pro",
    band: "5 GHz",
    ip: "192.168.1.102",
    lastSeen: "2 min ago",
    deviceType: "Work laptop",
    connection: "Strong",
  },
  {
    id: "smart-tv",
    name: "Living room TV",
    band: "5 GHz",
    ip: "192.168.1.115",
    lastSeen: "9 min ago",
    deviceType: "Streaming device",
    connection: "Stable",
  },
  {
    id: "ring",
    name: "Doorbell",
    band: "2.4 GHz",
    ip: "192.168.1.126",
    lastSeen: "18 min ago",
    deviceType: "Entry camera",
    connection: "Long range",
  },
];

export default function GatewayDevicesPage() {
  return (
    <div className="space-y-5 pb-2 lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
      <PageIntro
        eyebrow="Gateway"
        title="Connected devices"
        description="This route replaces the old card grid with a cleaner inventory view: scannable, filterable and closer to a modern SaaS operations table."
        actions={
          <>
            <StatusPill label="7 active devices" tone="success" pulse />
            <button
              type="button"
              className="theme-control-button rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Refresh list
            </button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="Connected" value="7" meta="Devices online right now" />
        <StatTile label="Recently active" value="4" meta="Seen within the last 20 minutes" />
        <StatTile label="Radio distribution" value="4 / 3" meta="5 GHz vs 2.4 GHz" />
      </div>

      <SurfacePanel className="overflow-hidden p-4 lg:min-h-0">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_74%)]" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="theme-tab-shell inline-flex flex-wrap gap-2 rounded-pill border p-1.5">
            {["All devices", "5 GHz", "2.4 GHz", "Recently active"].map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`theme-tab-item rounded-pill border px-4 py-2 text-body-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  index === 0
                    ? "theme-tab-item-active border"
                    : "border-transparent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="theme-inline-surface rounded-pill border border-white/82 bg-white/60 px-4 py-2 text-body-sm text-ink-muted shadow-[0_12px_22px_rgba(208,212,219,0.08)]">
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
              { key: "status", label: "Connection", align: "right" },
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
                    <div className="text-label-md text-ink-muted">{row.deviceType}</div>
                  </div>
                </div>,
                row.band,
                row.ip,
                row.lastSeen,
                <div key={`${row.id}-trust`} className="flex justify-end">
                  <StatusPill label={row.connection} tone={row.connection === "Long range" ? "brand" : "success"} />
                </div>,
              ],
            }))}
          />
        </ProgressiveBlur>
      </SurfacePanel>

      <SurfacePanel subtle className="overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />
        <div className="flex items-center gap-2 text-title-md text-ink">
          <Radio size={17} strokeWidth={1.8} />
          2.4 GHz vs 5 GHz
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="theme-inline-surface rounded-[1.25rem] border border-white/80 px-4 py-3.5">
            <div className="text-body-md font-medium text-ink">2.4 GHz</div>
            <p className="mt-2 text-body-sm text-ink-muted">
              Reaches farther and passes through walls more easily, so it is ideal for doorbells, cameras and devices that sit farther from the gateway.
            </p>
          </div>
          <div className="theme-inline-surface rounded-[1.25rem] border border-white/80 px-4 py-3.5">
            <div className="text-body-md font-medium text-ink">5 GHz</div>
            <p className="mt-2 text-body-sm text-ink-muted">
              Delivers faster speeds and lower congestion when the device is close enough, which makes it better for phones, laptops, TVs and gaming gear.
            </p>
          </div>
          <div className="theme-inline-surface rounded-[1.25rem] border border-white/80 px-4 py-3.5">
            <div className="text-body-md font-medium text-ink">Quick tip</div>
            <p className="mt-2 text-body-sm text-ink-muted">
              If a device feels slow far from the router, try moving it to 2.4 GHz. If it needs more speed near the gateway, keep it on 5 GHz.
            </p>
          </div>
        </div>
      </SurfacePanel>
    </div>
  );
}
