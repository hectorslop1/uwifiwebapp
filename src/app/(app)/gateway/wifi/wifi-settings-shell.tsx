"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  House,
  RefreshCw,
  Router,
  WalletCards,
  WifiHigh,
} from "lucide-react";

import {
  ActionCapsule,
  ActionCapsules,
} from "@/src/components/layout/action-capsules";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { GatewayOverviewData } from "@/src/server/gateway/types";

import { initialWifiSettingsActionState } from "../gateway-action-state";
import {
  rebootGatewayAction,
  saveWifiSettingsAction,
} from "../actions";
import { GatewayFlash, type GatewayFlashMessage } from "../gateway-ui";

type NetworkKey = "fiveG" | "twoFour";

type NetworkConfig = {
  ssid: string;
  password: string;
};

const inputClassName =
  "theme-input w-full rounded-[1.05rem] border px-4 py-2.5 text-[0.9rem] text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-[rgba(52,196,59,0.42)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(52,196,59,0.08),0_16px_30px_rgba(204,209,218,0.12),inset_0_1px_0_rgba(255,255,255,0.98)]";

function buildNetworks(gateway: GatewayOverviewData): Record<NetworkKey, NetworkConfig> {
  return {
    fiveG: {
      ssid: gateway.wifi5GName || "",
      password: gateway.wifi5GPassword || "",
    },
    twoFour: {
      ssid: gateway.wifi24GName || "",
      password: gateway.wifi24GPassword || "",
    },
  };
}

function NetworkSettingsCard({
  title,
  subtitle,
  value,
  showPassword,
  onTogglePassword,
  onChange,
  ssidName,
  passwordName,
}: {
  title: string;
  subtitle: string;
  value: NetworkConfig;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (field: keyof NetworkConfig, nextValue: string) => void;
  ssidName: string;
  passwordName: string;
}) {
  return (
    <SurfacePanel subtle className="self-start overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />

      <div className="relative flex items-center gap-3">
        <span className="theme-icon-surface flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/80 bg-[linear-gradient(180deg,rgba(241,251,243,0.96),rgba(232,248,235,0.92))] text-success">
          <WifiHigh size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className="text-[1.02rem] font-medium tracking-[-0.04em] text-ink">{title}</div>
          <div className="text-[0.82rem] text-ink-muted">{subtitle}</div>
        </div>
      </div>

      <div className="relative mt-4 space-y-3.5">
        <label className="space-y-1.5">
          <span className="text-label-md text-ink-muted">SSID</span>
          <input
            name={ssidName}
            value={value.ssid}
            onChange={(event) => onChange("ssid", event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-label-md text-ink-muted">Password</span>
          <div className="theme-input flex items-center rounded-[1.05rem] border px-4 py-2.5 transition-all duration-200 focus-within:border-[rgba(52,196,59,0.42)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(52,196,59,0.08),0_16px_30px_rgba(204,209,218,0.12),inset_0_1px_0_rgba(255,255,255,0.98)]">
            <input
              name={passwordName}
              type={showPassword ? "text" : "password"}
              value={value.password}
              onChange={(event) => onChange("password", event.target.value)}
              className="w-full bg-transparent text-body-sm text-ink outline-none"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="theme-control-button ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-ink-muted transition-all duration-200 hover:text-success"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.8} />
              ) : (
                <Eye size={16} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </label>
      </div>
    </SurfacePanel>
  );
}

export function WifiSettingsShell({
  initialGateway,
  flash,
}: Readonly<{
  initialGateway: GatewayOverviewData;
  flash: GatewayFlashMessage | null;
}>) {
  const [networks, setNetworks] = useState(() => buildNetworks(initialGateway));
  const [showPassword, setShowPassword] = useState<Record<NetworkKey, boolean>>({
    fiveG: false,
    twoFour: false,
  });
  const [state, formAction, isPending] = useActionState(
    saveWifiSettingsAction,
    initialWifiSettingsActionState,
  );

  const gateway = state.gateway ?? initialGateway;
  const savedAt =
    state.status === "success"
      ? "Saved just now"
      : state.status === "error" && state.message
        ? "Review the message and try again."
        : "Saved settings appear here after each update.";

  const baselineNetworks = useMemo(() => buildNetworks(gateway), [gateway]);

  const isDirty = useMemo(
    () => JSON.stringify(networks) !== JSON.stringify(baselineNetworks),
    [baselineNetworks, networks],
  );

  const updateNetwork = (
    networkKey: NetworkKey,
    field: keyof NetworkConfig,
    nextValue: string,
  ) => {
    setNetworks((current) => ({
      ...current,
      [networkKey]: {
        ...current[networkKey],
        [field]: nextValue,
      },
    }));
  };

  return (
    <div className="space-y-4 pb-2 xl:[zoom:0.88] 2xl:[zoom:0.94] 3xl:[zoom:1] lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
      <PageIntro
        eyebrow="Gateway"
        title="Wi‑Fi settings"
        description="Update the names and passwords for both Wi‑Fi bands in one place."
      />

      {flash ? <GatewayFlash tone={flash.status}>{flash.message}</GatewayFlash> : null}
      {state.status !== "idle" && state.message ? (
        <GatewayFlash tone={state.status === "success" ? "success" : "error"}>
          {state.message}
        </GatewayFlash>
      ) : null}

      <form
        action={formAction}
        className="grid items-start gap-3 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1fr)_15.5rem]"
      >
        <input type="hidden" name="redirectTo" value="/gateway/wifi" />
        <div className="grid content-start items-start gap-3 lg:grid-cols-2">
          <NetworkSettingsCard
            title={gateway.wifi5GName || "5 GHz network"}
            subtitle={`${gateway.devices5G.length} devices currently connected`}
            value={networks.fiveG}
            showPassword={showPassword.fiveG}
            onTogglePassword={() =>
              setShowPassword((current) => ({
                ...current,
                fiveG: !current.fiveG,
              }))
            }
            onChange={(field, nextValue) => updateNetwork("fiveG", field, nextValue)}
            ssidName="ssidFiveG"
            passwordName="passwordFiveG"
          />

          <NetworkSettingsCard
            title={gateway.wifi24GName || "2.4 GHz network"}
            subtitle={`${gateway.devices24G.length} devices currently connected`}
            value={networks.twoFour}
            showPassword={showPassword.twoFour}
            onTogglePassword={() =>
              setShowPassword((current) => ({
                ...current,
                twoFour: !current.twoFour,
              }))
            }
            onChange={(field, nextValue) => updateNetwork("twoFour", field, nextValue)}
            ssidName="ssidTwoFour"
            passwordName="passwordTwoFour"
          />

          <SurfacePanel subtle className="lg:col-span-2 p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <RefreshCw size={16} strokeWidth={1.8} />
              Quick links
            </div>
            <ActionCapsules className="mt-3 grid gap-2.5 lg:grid-cols-3">
              <ActionCapsule
                href="/gateway/devices"
                label="Review connected devices"
                icon={<Router size={16} strokeWidth={1.8} />}
                className="min-h-[3.15rem] rounded-[1.15rem] px-3.5 py-2.5"
              />
              <ActionCapsule
                href="/billing/payment-methods"
                label="Open payment methods"
                icon={<WalletCards size={16} strokeWidth={1.8} />}
                className="min-h-[3.15rem] rounded-[1.15rem] px-3.5 py-2.5"
              />
              <ActionCapsule
                href="/overview"
                label="Back to account overview"
                icon={<House size={16} strokeWidth={1.8} />}
                className="min-h-[3.15rem] rounded-[1.15rem] px-3.5 py-2.5"
              />
            </ActionCapsules>
            <div className="mt-3 grid gap-2.5 text-body-sm text-ink-muted sm:grid-cols-2">
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-4 py-3">
                Keep both network names easy to recognize for the devices in your home.
              </div>
              <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-4 py-3">
                Choose passwords with at least 8 characters so both networks stay secure.
              </div>
            </div>
          </SurfacePanel>
        </div>

        <div className="space-y-3">
          <SurfacePanel subtle className="overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_74%)]" />
            <div className="relative">
              <div className="text-title-md text-ink">Apply changes</div>
              <div className="mt-2 text-body-sm text-ink-muted">
                Review both networks before saving the updated names and passwords.
              </div>

              <div className="theme-soft-well mt-3 rounded-[1.05rem] border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
                    Status
                  </span>
                  <span
                    className={`rounded-pill px-2.5 py-1 text-[0.76rem] font-medium ${
                      isDirty
                        ? "bg-[rgba(255,243,220,0.98)] text-[#b67a17]"
                        : "bg-success-soft text-success"
                    }`}
                  >
                    {isDirty ? "Unsaved changes" : "All synced"}
                  </span>
                </div>

                <div className="mt-3 text-body-sm text-ink-muted">{savedAt}</div>
              </div>

              <div className="mt-3 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="theme-cta rounded-[1.1rem] px-4 py-3 text-body-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_24px_42px_rgba(111,191,118,0.34),inset_0_1px_0_rgba(255,255,255,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Saving network updates..." : "Save network updates"}
                </button>
                <button
                  type="submit"
                  formAction={rebootGatewayAction}
                  className="theme-control-button w-full rounded-[1.1rem] border px-4 py-3 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Restart gateway
                </button>
              </div>
            </div>
          </SurfacePanel>

        </div>
      </form>
    </div>
  );
}
