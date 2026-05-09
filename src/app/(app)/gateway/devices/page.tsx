import Link from "next/link";
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

function buildBandFilterHref(filter: "all" | "5g" | "24g") {
  return filter === "all" ? "/gateway/devices" : `/gateway/devices?band=${filter}`;
}

export default async function GatewayDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, gateway] = await Promise.all([
    searchParams,
    getGatewayOverviewData(
      context.user.customerId,
      context.accessToken,
    ),
  ]);

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

  const rawBand = Array.isArray(query.band) ? query.band[0] : query.band;
  const activeBand =
    rawBand === "5g" || rawBand === "24g" ? rawBand : "all";
  const rows =
    activeBand === "5g"
      ? gateway.devices5G
      : activeBand === "24g"
        ? gateway.devices24G
        : [...gateway.devices5G, ...gateway.devices24G];

  return (
    <div className="space-y-4 pb-3 xl:[zoom:0.88] 2xl:[zoom:0.94] 3xl:[zoom:1]">
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

      <div className="grid gap-2.5 md:grid-cols-3">
        <StatTile
          label="Connected"
          value={String(gateway.totalDevices)}
          meta="Devices online right now"
          className="rounded-[1.15rem] px-4 py-3"
        />
        <StatTile
          label="5 GHz"
          value={String(gateway.devices5G.length)}
          meta={gateway.wifi5GName || "5 GHz network"}
          className="rounded-[1.15rem] px-4 py-3"
        />
        <StatTile
          label="2.4 GHz"
          value={String(gateway.devices24G.length)}
          meta={gateway.wifi24GName || "2.4 GHz network"}
          className="rounded-[1.15rem] px-4 py-3"
        />
      </div>

      <SurfacePanel className="overflow-visible p-4">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_74%)]" />
        <div className="relative">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="theme-tab-shell inline-flex flex-wrap gap-2 rounded-pill border p-1.5">
              <Link
                href={buildBandFilterHref("all")}
                className={`rounded-pill px-4 py-2 text-body-sm transition-colors duration-200 ${
                  activeBand === "all"
                    ? "theme-tab-item theme-tab-item-active border"
                    : "theme-tab-item border border-transparent"
                }`}
              >
                All devices
              </Link>
              <Link
                href={buildBandFilterHref("5g")}
                className={`rounded-pill px-4 py-2 text-body-sm transition-colors duration-200 ${
                  activeBand === "5g"
                    ? "theme-tab-item theme-tab-item-active border"
                    : "theme-tab-item border border-transparent"
                }`}
              >
                5 GHz: {gateway.devices5G.length}
              </Link>
              <Link
                href={buildBandFilterHref("24g")}
                className={`rounded-pill px-4 py-2 text-body-sm transition-colors duration-200 ${
                  activeBand === "24g"
                    ? "theme-tab-item theme-tab-item-active border"
                    : "theme-tab-item border border-transparent"
                }`}
              >
                2.4 GHz: {gateway.devices24G.length}
              </Link>
            </div>

            <div className="theme-inline-surface rounded-pill border border-white/82 bg-white/60 px-4 py-2 text-body-sm text-ink-muted shadow-[0_12px_22px_rgba(208,212,219,0.08)]">
              Showing {rows.length} connected {activeBand === "all" ? "devices" : activeBand === "5g" ? "5 GHz devices" : "2.4 GHz devices"}
            </div>
          </div>

          {rows.length ? (
            <div className="relative mt-4">
              <div className="max-h-[24rem] overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="overflow-x-auto pb-8">
                  <div className="min-w-[52rem]">
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
                            className="flex min-w-[12rem] items-center gap-3"
                          >
                            <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] text-ink-soft">
                              {getDeviceIcon(row.name)}
                            </span>
                            <div>
                              <div className="text-[0.92rem] font-medium text-ink">{row.name}</div>
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
              <ProgressiveBlur position="bottom" height="24%" />
            </div>
          ) : (
            <FeedbackState
              className="mt-4 min-h-[12rem]"
              title="No connected devices"
              description="No devices are currently reporting as connected to this gateway."
            />
          )}
        </div>
      </SurfacePanel>

      <SurfacePanel subtle className="overflow-hidden p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-title-md text-ink">
            <Radio size={17} strokeWidth={1.8} />
            2.4 GHz vs 5 GHz
          </div>
          <div className="mt-3 grid gap-2.5 md:grid-cols-3">
            <div className="theme-inline-surface rounded-[1.1rem] border border-white/80 px-4 py-3">
              <div className="text-[0.95rem] font-medium text-ink">2.4 GHz</div>
              <p className="mt-1.5 text-[0.84rem] leading-5 text-ink-muted">
                Best for devices that are farther away or need more range through walls.
              </p>
            </div>
            <div className="theme-inline-surface rounded-[1.1rem] border border-white/80 px-4 py-3">
              <div className="text-[0.95rem] font-medium text-ink">5 GHz</div>
              <p className="mt-1.5 text-[0.84rem] leading-5 text-ink-muted">
                Best for faster speeds when devices stay closer to the gateway.
              </p>
            </div>
            <div className="theme-inline-surface rounded-[1.1rem] border border-white/80 px-4 py-3">
              <div className="text-[0.95rem] font-medium text-ink">Quick tip</div>
              <p className="mt-1.5 text-[0.84rem] leading-5 text-ink-muted">
                If a device needs more stability at a distance, try keeping it on the 2.4 GHz network.
              </p>
            </div>
          </div>
        </div>
      </SurfacePanel>
    </div>
  );
}
