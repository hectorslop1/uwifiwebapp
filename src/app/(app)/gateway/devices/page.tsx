import {
  Laptop2,
  Radio,
  ShieldEllipsis,
  Smartphone,
} from "lucide-react";

import { ProgressiveBlur } from "@/src/components/magic/progressive-blur";
import { FeedbackState } from "@/src/components/ui/feedback-state";
import { PageIntro } from "@/src/components/ui/page-intro";
import { PremiumTable } from "@/src/components/ui/premium-table";
import { RefreshRouteButton } from "@/src/components/ui/refresh-route-button";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getGatewayOverviewData } from "@/src/server/gateway/api";

function getDeviceIcon(name: string) {
  if (/iphone|phone|pixel|galaxy/i.test(name)) {
    return <Smartphone size={16} strokeWidth={1.8} />;
  }

  if (/macbook|laptop|pc|desktop/i.test(name)) {
    return <Laptop2 size={16} strokeWidth={1.8} />;
  }

  return <ShieldEllipsis size={16} strokeWidth={1.8} />;
}

export default async function GatewayDevicesPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const gateway = await getGatewayOverviewData(
    context.user.customerId,
    context.accessToken,
  );

  if (!gateway) {
    return (
      <div className="space-y-5 pb-6">
        <PageIntro
          eyebrow="Gateway"
          title="Connected devices"
          description="Review the devices using your Wi‑Fi and which band they are currently using."
        />
        <FeedbackState
          title="No gateway connected"
          description="Once this account has an active gateway, connected devices will appear here."
        />
      </div>
    );
  }

  const rows = [...gateway.devices5G, ...gateway.devices24G];

  return (
    <div className="space-y-5 pb-6">
      <PageIntro
        eyebrow="Gateway"
        title="Connected devices"
        description="Review the devices currently connected to your Wi‑Fi across both network bands."
        actions={
          <>
            <StatusPill
              label={`${gateway.totalDevices} active devices`}
              tone="success"
              pulse={gateway.totalDevices > 0}
            />
            <RefreshRouteButton label="Refresh list" />
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="Connected" value={String(gateway.totalDevices)} meta="Devices online right now" />
        <StatTile label="5 GHz" value={String(gateway.devices5G.length)} meta={gateway.wifi5GName || "5 GHz network"} />
        <StatTile label="2.4 GHz" value={String(gateway.devices24G.length)} meta={gateway.wifi24GName || "2.4 GHz network"} />
      </div>

      <SurfacePanel className="overflow-visible p-4">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_74%)]" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="theme-tab-shell inline-flex flex-wrap gap-2 rounded-pill border p-1.5">
            <div className="theme-tab-item theme-tab-item-active rounded-pill border px-4 py-2 text-body-sm">
              All devices
            </div>
            <div className="theme-tab-item rounded-pill border border-transparent px-4 py-2 text-body-sm">
              5 GHz: {gateway.devices5G.length}
            </div>
            <div className="theme-tab-item rounded-pill border border-transparent px-4 py-2 text-body-sm">
              2.4 GHz: {gateway.devices24G.length}
            </div>
          </div>

          <div className="theme-inline-surface rounded-pill border border-white/82 bg-white/60 px-4 py-2 text-body-sm text-ink-muted shadow-[0_12px_22px_rgba(208,212,219,0.08)]">
            Showing {rows.length} connected devices
          </div>
        </div>

        {rows.length ? (
          <div className="relative mt-4">
            <div className="max-h-[30rem] overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="overflow-x-auto pb-14">
                <div className="min-w-[56rem]">
                  <PremiumTable
                    columns={[
                      { key: "device", label: "Device" },
                      { key: "band", label: "Band" },
                      { key: "ip", label: "IP address" },
                      { key: "mac", label: "MAC address" },
                      { key: "status", label: "Connection", align: "right" },
                    ]}
                    rows={rows.map((row) => ({
                      id: row.id,
                      cells: [
                        <div
                          key={`${row.id}-device`}
                          className="flex min-w-[14rem] items-center gap-3"
                        >
                          <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] text-ink-soft">
                            {getDeviceIcon(row.name)}
                          </span>
                          <div>
                            <div className="font-medium text-ink">{row.name}</div>
                            <div className="text-label-md text-ink-muted">
                              {row.connectionType || "Wi‑Fi device"}
                            </div>
                          </div>
                        </div>,
                        <span key={`${row.id}-radio`} className="whitespace-nowrap">
                          {row.band}
                        </span>,
                        <span key={`${row.id}-ip`} className="whitespace-nowrap">
                          {row.ipAddress || "Unavailable"}
                        </span>,
                        <span key={`${row.id}-mac`} className="whitespace-nowrap">
                          {row.macAddress || "Unavailable"}
                        </span>,
                        <div key={`${row.id}-band`} className="flex justify-end">
                          <StatusPill
                            label={row.band}
                            tone={row.band === "5 GHz" ? "success" : "brand"}
                          />
                        </div>,
                      ],
                    }))}
                  />
                </div>
              </div>
            </div>
            <ProgressiveBlur position="bottom" height="34%" />
          </div>
        ) : (
          <FeedbackState
            className="mt-4 min-h-[12rem]"
            title="No connected devices"
            description="No devices are currently reporting as connected to this gateway."
          />
        )}
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
              Best for devices that are farther away or need more range through walls.
            </p>
          </div>
          <div className="theme-inline-surface rounded-[1.25rem] border border-white/80 px-4 py-3.5">
            <div className="text-body-md font-medium text-ink">5 GHz</div>
            <p className="mt-2 text-body-sm text-ink-muted">
              Best for faster speeds when devices stay closer to the gateway.
            </p>
          </div>
          <div className="theme-inline-surface rounded-[1.25rem] border border-white/80 px-4 py-3.5">
            <div className="text-body-md font-medium text-ink">Quick tip</div>
            <p className="mt-2 text-body-sm text-ink-muted">
              If a device needs more stability at a distance, try keeping it on the 2.4 GHz network.
            </p>
          </div>
        </div>
      </SurfacePanel>
    </div>
  );
}
