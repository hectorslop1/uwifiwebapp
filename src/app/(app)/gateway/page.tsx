import Link from "next/link";
import {
  Activity,
  ChevronRight,
  Gauge,
  Radio,
  RotateCcw,
  Wifi,
} from "lucide-react";

import { FeedbackState } from "@/src/components/ui/feedback-state";
import { PageIntro } from "@/src/components/ui/page-intro";
import { RefreshRouteButton } from "@/src/components/ui/refresh-route-button";
import { StatTile } from "@/src/components/ui/stat-tile";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getGatewayOverviewData } from "@/src/server/gateway/api";

import { rebootGatewayAction } from "./actions";
import {
  GatewayFlash,
  getConnectionLabel,
  getConnectionTone,
  getGatewayFlashMessage,
} from "./gateway-ui";

function getBandPalette(band: "2.4 GHz" | "5 GHz") {
  if (band === "2.4 GHz") {
    return {
      icon: "bg-[rgba(108,69,255,0.14)] text-brand",
      panel:
        "border-[rgba(108,69,255,0.18)] bg-[linear-gradient(180deg,rgba(var(--color-surface-raised),0.74),rgba(108,69,255,0.08))]",
      badge: "bg-[rgba(108,69,255,0.12)] text-brand",
      dot: "bg-brand",
    };
  }

  return {
    icon: "bg-[rgba(52,196,59,0.14)] text-success",
    panel:
      "border-[rgba(52,196,59,0.18)] bg-[linear-gradient(180deg,rgba(var(--color-surface-raised),0.74),rgba(52,196,59,0.08))]",
    badge: "bg-[rgba(52,196,59,0.12)] text-success",
    dot: "bg-success",
  };
}

export default async function GatewayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const query = await searchParams;
  const flash = getGatewayFlashMessage(query);
  const gateway = await getGatewayOverviewData(
    context.user.customerId,
    context.accessToken,
  );

  if (!gateway) {
    return (
      <div className="space-y-4 pb-2 lg:flex lg:min-h-0 lg:flex-col">
        <PageIntro
          eyebrow="Gateway"
          title="Gateway control center"
          description="Monitor your network health, connected devices and Wi-Fi settings in one place."
        />
        <FeedbackState
          title="No gateway connected"
          description="This account does not have an active gateway device yet."
          icon={<Wifi size={22} strokeWidth={1.8} />}
          action={
            <Link
              href="/overview"
              className="theme-control-button inline-flex items-center rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Back to overview
            </Link>
          }
        />
      </div>
    );
  }

  function formatGatewayUptime(value?: string | null) {
    if (!value) {
      return "Unavailable";
    }

    const seconds = Number(value);

    if (!Number.isFinite(seconds)) {
      return value;
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${Math.max(1, minutes)}m`;
  }

  const gatewayStatusTone = getConnectionTone(gateway.connectionStatus);
  const gatewayStatusLabel = getConnectionLabel(gateway.connectionStatus);
  const radioHighlights = [
    {
      label: "5 GHz devices",
      value: String(gateway.devices5G.length),
      meta: gateway.wifi5GName || "5 GHz network",
      palette: getBandPalette("5 GHz"),
    },
    {
      label: "2.4 GHz devices",
      value: String(gateway.devices24G.length),
      meta: gateway.wifi24GName || "2.4 GHz network",
      palette: getBandPalette("2.4 GHz"),
    },
    {
      label: "Primary Wi-Fi",
      value: gateway.wifiName || "Unavailable",
      meta: gateway.serialNumber,
      palette: getBandPalette("5 GHz"),
    },
  ];

  return (
    <div className="space-y-4 pb-2 xl:[zoom:0.93] 2xl:[zoom:1]">
      <PageIntro
        eyebrow="Gateway"
        title="Gateway control center"
        description="Monitor your connection, review the active radios and keep your Wi-Fi settings up to date."
        actions={
          <>
            <StatusPill
              label={gatewayStatusLabel}
              tone={gatewayStatusTone}
              pulse={gateway.isConnected}
              variant="plain"
            />
            <Link
              href="/gateway/wifi"
              className="theme-control-button inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <Wifi size={16} strokeWidth={1.8} />
              Adjust Wi-Fi
            </Link>
          </>
        }
      />

      {flash ? <GatewayFlash tone={flash.status}>{flash.message}</GatewayFlash> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Gateway status"
          value={
            <StatusPill
              label={gatewayStatusLabel}
              tone={gatewayStatusTone}
              pulse
              variant="plain"
              className="text-[1.1rem] font-medium tracking-[-0.045em]"
            />
          }
          meta={gateway.isConnected ? "Connection looks healthy" : "Review the gateway status"}
        />
        <StatTile
          label="Connected devices"
          value={String(gateway.totalDevices)}
          meta="Across both Wi-Fi bands"
        />
        <StatTile
          label="5 GHz devices"
          value={String(gateway.devices5G.length)}
          meta={gateway.wifi5GName || "5 GHz network"}
          className="border-[rgba(52,196,59,0.18)] bg-[linear-gradient(180deg,rgba(var(--color-surface-raised),0.74),rgba(52,196,59,0.08))]"
        />
        <StatTile
          label="2.4 GHz devices"
          value={String(gateway.devices24G.length)}
          meta={gateway.wifi24GName || "2.4 GHz network"}
          className="border-[rgba(108,69,255,0.18)] bg-[linear-gradient(180deg,rgba(var(--color-surface-raised),0.74),rgba(108,69,255,0.08))]"
        />
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
        <SurfacePanel className="overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-b-[2.2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative">
              <div className="text-title-md text-ink">Network overview</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                Keep both Wi-Fi bands and the key network details visible without crowding the panel.
              </div>
            </div>

            <RefreshRouteButton label="Refresh" />
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 xl:grid-cols-2">
              {gateway.networks.map((network) => (
                <div
                  key={network.key}
                  className={`theme-inline-surface relative overflow-hidden rounded-[1.35rem] border px-4 py-3.5 ${getBandPalette(network.band).panel}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-4 top-0 h-20 rounded-b-[1.6rem] ${
                      network.band === "2.4 GHz"
                        ? "bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.16),transparent_72%)]"
                        : "bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.18),transparent_72%)]"
                    }`}
                  />
                  <div className="flex items-center gap-3 text-ink-soft">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-[0.95rem] ${getBandPalette(network.band).icon}`}
                    >
                      <Wifi size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                      <div className="text-body-md font-medium text-ink">{network.title}</div>
                      <div className="text-body-sm text-ink-muted">
                        {network.devices.length} connected devices
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-body-sm text-ink-muted">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.74rem] font-medium ${getBandPalette(network.band).badge}`}
                    >
                      {network.band}
                    </span>
                    <span>{gateway.isConnected ? "Online" : "Check status"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="theme-soft-well rounded-[1.25rem] border border-line/30 px-4 py-3.5">
              <div className="flex items-center gap-2 text-body-md text-ink">
                <Activity size={17} strokeWidth={1.8} />
                Connection summary
              </div>
              <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                {radioHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                          {item.label}
                        </div>
                        <div className="mt-1 text-[1rem] font-medium text-ink-soft">
                          {item.value}
                        </div>
                      </div>
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.palette.dot}`} />
                    </div>
                    <div className="mt-2 break-words text-[0.78rem] leading-5 text-ink-muted">
                      {item.meta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="theme-inline-surface rounded-[1rem] border border-[rgba(108,69,255,0.18)] px-3.5 py-2.5 text-[0.84rem] leading-6 text-ink-muted">
                <div className="mb-1 flex items-center gap-2 text-ink">
                  <Radio size={14} strokeWidth={1.8} />
                  <span className="text-[0.82rem] font-medium">2.4 GHz</span>
                </div>
                Best for range and walls when devices sit farther away.
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-[rgba(52,196,59,0.18)] px-3.5 py-2.5 text-[0.84rem] leading-6 text-ink-muted">
                <div className="mb-1 flex items-center gap-2 text-ink">
                  <Radio size={14} strokeWidth={1.8} />
                  <span className="text-[0.82rem] font-medium">5 GHz</span>
                </div>
                Best for faster speed when devices stay closer to the gateway.
              </div>
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel subtle className="relative overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.08),transparent_74%)]" />
          <div className="relative">
            <div className="text-title-md text-ink">Control panel</div>
            <div className="mt-1 text-body-sm text-ink-muted">
              Keep the core service details visible without stretching the panel.
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                  Status
                </div>
                <StatusPill
                  label={gatewayStatusLabel}
                  tone={gatewayStatusTone}
                  pulse
                  variant="plain"
                  className="mt-2 text-[0.96rem] font-medium"
                />
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                  Uptime
                </div>
                <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                  {formatGatewayUptime(gateway.uptime)}
                </div>
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                  IP address
                </div>
                <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                  {gateway.ipAddress || "Unavailable"}
                </div>
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-3.5 py-3">
                <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                  Serial number
                </div>
                <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                  {gateway.serialNumber}
                </div>
              </div>
            </div>

            <div className="theme-inline-surface mt-3 rounded-[1rem] border border-line/35 px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                    Primary network
                  </div>
                  <div className="mt-1.5 text-[0.96rem] font-medium text-ink-soft">
                    {gateway.wifiName || "Unavailable"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.74rem] font-medium ${
                    gateway.isConnected
                      ? "bg-[rgba(52,196,59,0.12)] text-success"
                      : "bg-[rgba(230,91,74,0.12)] text-[#d95b49]"
                  }`}
                >
                  {gateway.totalDevices} online
                </span>
              </div>
            </div>

            <div className="mt-3 border-t border-line/25 pt-3">
              <div className="mb-3 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
                Quick actions
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <form action={rebootGatewayAction}>
                  <input type="hidden" name="redirectTo" value="/gateway" />
                  <button
                    type="submit"
                    className="theme-control-button group inline-flex min-h-[3.15rem] w-full items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 text-left text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                  >
                    <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(255,249,243,0.98),rgba(247,240,232,0.95))] text-[#9a6f3d] transition-colors duration-200">
                      <RotateCcw size={16} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 text-[0.92rem] font-medium text-ink-soft transition-colors duration-200 group-hover:text-ink">
                      Reboot Gateway
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-soft"
                    />
                  </button>
                </form>

                <Link
                  href="/gateway/speed-test"
                  className="theme-control-button group flex min-h-[3.15rem] items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                >
                  <span className="theme-icon-surface flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(244,251,244,0.98),rgba(233,246,234,0.95))] text-success transition-colors duration-200">
                    <Gauge size={16} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1 text-[0.92rem] font-medium text-ink-soft transition-colors duration-200 group-hover:text-ink">
                    Speed Test
                  </span>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                    className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-soft"
                  />
                </Link>
              </div>
            </div>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
