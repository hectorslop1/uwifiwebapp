"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw, WifiHigh } from "lucide-react";

import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { cn } from "@/src/lib/cn";
import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

type NetworkKey = "fiveG" | "twoFour";

type NetworkConfig = {
  ssid: string;
  password: string;
};

const initialNetworks: Record<NetworkKey, NetworkConfig> = {
  fiveG: {
    ssid: "U-WiFi 5G",
    password: "SecureFiber5G!",
  },
  twoFour: {
    ssid: "U-WiFi",
    password: "SecureFiber24!",
  },
};

const inputClassName =
  "theme-input w-full rounded-[1rem] border px-4 py-3 text-body-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-[rgba(52,196,59,0.42)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(52,196,59,0.08),0_16px_30px_rgba(204,209,218,0.12),inset_0_1px_0_rgba(255,255,255,0.98)]";

function NetworkSettingsCard({
  title,
  subtitle,
  value,
  showPassword,
  onTogglePassword,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: NetworkConfig;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (field: keyof NetworkConfig, nextValue: string) => void;
}) {
  return (
    <SurfacePanel subtle className="overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.14),transparent_74%)]" />

      <div className="relative flex items-center gap-3">
        <span className="theme-icon-surface flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/80 bg-[linear-gradient(180deg,rgba(241,251,243,0.96),rgba(232,248,235,0.92))] text-success">
          <WifiHigh size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className="text-title-md text-ink">{title}</div>
          <div className="text-body-sm text-ink-muted">{subtitle}</div>
        </div>
      </div>

      <div className="relative mt-5 space-y-4">
        <label className="space-y-1.5">
          <span className="text-label-md text-ink-muted">SSID</span>
          <input
            value={value.ssid}
            onChange={(event) => onChange("ssid", event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-label-md text-ink-muted">Password</span>
          <div className="theme-input flex items-center rounded-[1rem] border px-4 py-3 transition-all duration-200 focus-within:border-[rgba(52,196,59,0.42)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(52,196,59,0.08),0_16px_30px_rgba(204,209,218,0.12),inset_0_1px_0_rgba(255,255,255,0.98)]">
            <input
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

export function WifiSettingsShell() {
  const [networks, setNetworks] = useState(initialNetworks);
  const [showPassword, setShowPassword] = useState<Record<NetworkKey, boolean>>({
    fiveG: false,
    twoFour: false,
  });
  const [savedAt, setSavedAt] = useState("Saved 2 min ago");

  const isDirty = useMemo(
    () => JSON.stringify(networks) !== JSON.stringify(initialNetworks),
    [networks],
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

  const handleSave = () => {
    setSavedAt("Changes staged for next apply");
  };

  return (
    <div className="space-y-5 pb-2 lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
      <PageIntro
        eyebrow="Gateway"
        title="Wi-Fi settings"
        description="Update both network names and passwords in one place, with a cleaner save flow and stronger state feedback than the older control panel."
      />

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 xl:grid-cols-[minmax(0,1.15fr)_19rem]">
        <div className="grid gap-4 lg:grid-cols-2">
          <NetworkSettingsCard
            title="U-WiFi 5G"
            subtitle="Primary high-band radio"
            value={networks.fiveG}
            showPassword={showPassword.fiveG}
            onTogglePassword={() =>
              setShowPassword((current) => ({
                ...current,
                fiveG: !current.fiveG,
              }))
            }
            onChange={(field, nextValue) => updateNetwork("fiveG", field, nextValue)}
          />

          <NetworkSettingsCard
            title="U-WiFi"
            subtitle="Coverage-focused radio"
            value={networks.twoFour}
            showPassword={showPassword.twoFour}
            onTogglePassword={() =>
              setShowPassword((current) => ({
                ...current,
                twoFour: !current.twoFour,
              }))
            }
            onChange={(field, nextValue) => updateNetwork("twoFour", field, nextValue)}
          />
        </div>

        <div className="space-y-4">
          <SurfacePanel subtle className="overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(52,196,59,0.12),transparent_74%)]" />
            <div className="relative">
              <div className="text-title-md text-ink">Apply changes</div>
              <div className="mt-2 text-body-sm text-ink-muted">
                Keep both bands aligned, review pending edits and push the update when the network name or password changes.
              </div>

              <div className="theme-soft-well mt-4 rounded-[1.15rem] border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
                    Status
                  </span>
                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-1 text-label-md",
                      isDirty
                        ? "bg-[rgba(255,243,220,0.98)] text-[#b67a17]"
                        : "bg-success-soft text-success",
                    )}
                  >
                    {isDirty ? "Unsaved changes" : "All synced"}
                  </span>
                </div>

                <div className="mt-3 text-body-sm text-ink-muted">{savedAt}</div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="theme-cta rounded-pill px-4 py-3 text-body-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(111,191,118,0.34),inset_0_1px_0_rgba(255,255,255,0.22)]"
                >
                  Save network updates
                </button>
                <button
                  type="button"
                  className="theme-control-button rounded-pill border px-4 py-3 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  Restart gateway
                </button>
              </div>
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Related actions</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/gateway/devices" label="Review connected devices" />
              <ActionCapsule href="/billing/payment-methods" label="Confirm autopay method" />
              <ActionCapsule href="/overview" label="Back to account overview" />
            </ActionCapsules>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <RefreshCw size={16} strokeWidth={1.8} />
              Update guidance
            </div>
            <div className="mt-3 space-y-2 text-body-sm text-ink-muted">
              <p>Changing the SSID updates the customer-facing network name once you apply the save flow.</p>
              <p>Updating the password helps keep both bands aligned, and the restart action stays available only if you want a manual reset afterward.</p>
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
