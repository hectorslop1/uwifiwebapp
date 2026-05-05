import Link from "next/link";
import { Activity, Radio, RotateCcw, Wifi } from "lucide-react";

import {
  ActionCapsule,
  ActionCapsules,
} from "@/src/components/layout/action-capsules";
import { FeedbackState } from "@/src/components/ui/feedback-state";
import { KeyValueList } from "@/src/components/ui/key-value-list";
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
          description="Monitor your network health, connected devices and Wi‑Fi settings in one place."
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

  const networkEvents = [
    `${gateway.networks[0]?.devices.length ?? 0} devices are connected on 5 GHz.`,
    `${gateway.networks[1]?.devices.length ?? 0} devices are connected on 2.4 GHz.`,
    `Primary Wi‑Fi name: ${gateway.wifiName || "Unavailable"}.`,
  ];

  const gatewayMeta: Array<{
    label: string;
    value: string;
    tone?: "default" | "success" | "brand";
  }> = [
    { label: "Serial number", value: gateway.serialNumber },
    { label: "Primary network", value: gateway.wifiName || "Unavailable" },
    { label: "IP address", value: gateway.ipAddress || "Unavailable" },
    { label: "Uptime", value: gateway.uptime || "Unavailable" },
    {
      label: "Status",
      value: getConnectionLabel(gateway.connectionStatus),
      tone: getConnectionTone(gateway.connectionStatus),
    },
  ];

  return (
    <div className="space-y-4 pb-2 xl:[zoom:0.93] 2xl:[zoom:1]">
      <PageIntro
        eyebrow="Gateway"
        title="Gateway control center"
        description="Monitor your connection, review the active radios and keep your Wi‑Fi settings up to date."
        actions={
          <>
            <StatusPill
              label={getConnectionLabel(gateway.connectionStatus)}
              tone={getConnectionTone(gateway.connectionStatus)}
              pulse={gateway.isConnected}
            />
            <Link
              href="/gateway/wifi"
              className="theme-control-button inline-flex items-center rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Adjust Wi‑Fi
            </Link>
          </>
        }
      />

      {flash ? <GatewayFlash tone={flash.status}>{flash.message}</GatewayFlash> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Gateway status"
          value={getConnectionLabel(gateway.connectionStatus)}
          meta={gateway.isConnected ? "Connection looks healthy" : "Review the gateway status"}
        />
        <StatTile
          label="Connected devices"
          value={String(gateway.totalDevices)}
          meta="Across both Wi‑Fi bands"
        />
        <StatTile
          label="5 GHz devices"
          value={String(gateway.devices5G.length)}
          meta={gateway.wifi5GName || "5 GHz network"}
        />
        <StatTile
          label="2.4 GHz devices"
          value={String(gateway.devices24G.length)}
          meta={gateway.wifi24GName || "2.4 GHz network"}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_18rem]">
        <SurfacePanel className="overflow-hidden p-4 sm:p-4">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-b-[2.2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <div className="text-title-md text-ink">Radio summary</div>
              <div className="mt-1 text-body-sm text-ink-muted">
                Review both Wi‑Fi bands and how many devices are currently connected to each one.
              </div>
            </div>

            <RefreshRouteButton label="Refresh" />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {gateway.networks.map((network) => (
              <div
                key={network.key}
                className="theme-inline-surface relative overflow-hidden rounded-[1.35rem] border border-[#edf5ee] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(243,249,244,0.8))] px-4 py-3.5 shadow-[0_14px_28px_rgba(200,210,202,0.08),inset_0_1px_0_rgba(255,255,255,0.94)]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-20 rounded-b-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.18),transparent_72%)]" />
                <div className="flex items-center gap-3 text-ink-soft">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-success-soft text-success">
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
                  <span>{network.band}</span>
                  <span>{gateway.isConnected ? "Online" : "Check status"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="theme-soft-well mt-3 rounded-[1.25rem] border border-line/30 bg-white/45 px-4 py-3">
            <div className="flex items-center gap-2 text-body-md text-ink">
              <Activity size={17} strokeWidth={1.8} />
              Network summary
            </div>
            <div className="mt-3 space-y-2.5">
              {networkEvents.map((event) => (
                <div
                  key={event}
                  className="flex items-start gap-3 border-b border-line/20 pb-2.5 text-body-sm text-ink-muted last:border-b-0 last:pb-0"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success" />
                  <span>{event}</span>
                </div>
              ))}
            </div>
          </div>
        </SurfacePanel>

        <div className="space-y-3">
          <SurfacePanel subtle className="overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.1),transparent_74%)]" />
            <div className="text-title-md text-ink">Gateway details</div>
            <div className="mt-4">
              <KeyValueList items={gatewayMeta} />
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(108,69,255,0.08),transparent_74%)]" />
            <div className="text-title-md text-ink">Primary actions</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/gateway/devices" label="Inspect devices" />
              <ActionCapsule href="/gateway/wifi" label="Update Wi‑Fi credentials" />
              <ActionCapsule href="/gateway/speed-test" label="Run speed test" />
            </ActionCapsules>
            <form action={rebootGatewayAction} className="mt-4">
              <input type="hidden" name="redirectTo" value="/gateway" />
              <button
                type="submit"
                className="theme-control-button inline-flex w-full items-center justify-center gap-2 rounded-pill border px-4 py-3 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <RotateCcw size={15} strokeWidth={1.8} />
                Reboot gateway
              </button>
            </form>
            <div className="mt-4 border-t border-line/25 pt-4">
              <div className="flex items-center gap-2 text-title-md text-ink">
              <Radio size={17} strokeWidth={1.8} />
              Wi‑Fi bands
              </div>
              <div className="mt-3 space-y-2 text-body-sm text-ink-muted">
                <p>2.4 GHz reaches farther and is better for devices that sit away from the gateway.</p>
                <p>5 GHz usually delivers higher speeds when devices stay closer to the gateway.</p>
              </div>
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
