"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Bell, LockKeyhole, Save, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { SettingsProfile } from "@/src/server/settings/types";

import {
  changePasswordSettingsAction,
  saveProfileSettingsAction,
} from "./actions";
import type { SettingsFlashMessage, SettingsSection } from "./settings-ui";

const fieldClassName =
  "theme-input w-full rounded-[1rem] border px-4 py-3 text-body-sm text-ink outline-none placeholder:text-ink-faint";

const settingsKey = "uwifi-settings-v1";

type ThemePreference = "light" | "dark" | "system";
type DensityPreference = "comfortable" | "compact";
type LocalePreference = "en" | "es";
type TimezonePreference = "america-tijuana" | "america-los-angeles";

type PortalPreferences = {
  theme: ThemePreference;
  language: LocalePreference;
  timezone: TimezonePreference;
  density: DensityPreference;
};

type PortalNotifications = {
  billing: boolean;
  outages: boolean;
  promotions: boolean;
};

const defaultPreferences: PortalPreferences = {
  theme: "system",
  language: "en",
  timezone: "america-tijuana",
  density: "comfortable",
};

const defaultNotifications: PortalNotifications = {
  billing: true,
  outages: true,
  promotions: false,
};

function SectionHeader({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="space-y-1">
      <div className="text-title-md text-ink">{title}</div>
      <div className="text-body-sm text-ink-muted">{description}</div>
    </div>
  );
}

function SettingsFlash({
  tone,
  children,
}: Readonly<{
  tone: "success" | "error";
  children: string;
}>) {
  return (
    <div
      className={`rounded-[1.25rem] border px-4 py-3 text-body-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ${
        tone === "success"
          ? "border-[rgba(52,196,59,0.22)] bg-[rgba(52,196,59,0.12)] text-success"
          : "border-[rgba(230,91,74,0.24)] bg-[rgba(230,91,74,0.12)] text-[#d95b49]"
      }`}
    >
      {children}
    </div>
  );
}

function SectionIcon({
  children,
  tone = "green",
}: Readonly<{
  children: ReactNode;
  tone?: "green" | "soft";
}>) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-[0.95rem] ${
        tone === "green"
          ? "bg-[linear-gradient(180deg,#78dc60_0%,#6bcf54_100%)] text-white shadow-[0_18px_35px_rgba(109,201,89,0.32)]"
          : "theme-icon-surface border border-white/70 text-success"
      }`}
    >
      {children}
    </span>
  );
}

function FormSubmitButton({
  idleLabel,
  pendingLabel,
}: Readonly<{
  idleLabel: string;
  pendingLabel: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="theme-cta inline-flex min-h-[2.85rem] items-center justify-center gap-2 rounded-[1rem] px-5 text-body-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Save size={16} strokeWidth={1.8} />
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: Readonly<{
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}>) {
  return (
    <div className="theme-inline-surface flex items-center justify-between gap-4 rounded-[1.15rem] border border-line/35 px-4 py-3.5">
      <div>
        <div className="text-body-md font-medium text-ink">{title}</div>
        <div className="text-body-sm text-ink-muted">{description}</div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
          checked ? "bg-success/85" : "bg-line-strong/70"
        }`}
      >
        <span
          className={`theme-toggle-knob absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function getInitialThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return defaultPreferences.theme;
  }

  const storedTheme = window.localStorage.getItem("uwifi-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "system";
}

function getStoredSettings() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(settingsKey);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as {
      preferences?: Partial<PortalPreferences>;
      notifications?: Partial<PortalNotifications>;
    };
  } catch {
    return null;
  }
}

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") {
    return theme;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyPreferences(preferences: PortalPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(preferences.theme);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.density = preferences.density;
  document.documentElement.lang = preferences.language;
  window.localStorage.setItem("uwifi-theme", preferences.theme);
}

function saveStoredSettings(
  preferences: PortalPreferences,
  notifications: PortalNotifications,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    settingsKey,
    JSON.stringify({ preferences, notifications }),
  );
}

export function SettingsShell({
  initialProfile,
  initialSection,
  flash,
}: Readonly<{
  initialProfile: SettingsProfile;
  initialSection: SettingsSection;
  flash: SettingsFlashMessage | null;
}>) {
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [preferences, setPreferences] = useState<PortalPreferences>(() => {
    const stored = getStoredSettings();

    return {
      ...defaultPreferences,
      theme: getInitialThemePreference(),
      ...stored?.preferences,
    };
  });
  const [notifications, setNotifications] = useState<PortalNotifications>(() => {
    const stored = getStoredSettings();

    return {
      ...defaultNotifications,
      ...stored?.notifications,
    };
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (preferences.theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyPreferences(preferences);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preferences]);

  const notificationsList = useMemo(
    () => [
      {
        key: "billing" as const,
        title: "Billing updates",
        description: "Invoices, failed charges, due reminders and payment confirmations.",
      },
      {
        key: "outages" as const,
        title: "Gateway and outage alerts",
        description: "Connection issues, gateway restarts and important service events.",
      },
      {
        key: "promotions" as const,
        title: "Offers and product news",
        description: "Optional updates about plans, hardware and bundles.",
      },
    ],
    [],
  );

  const persistPreferences = () => {
    applyPreferences(preferences);
    saveStoredSettings(preferences, notifications);
    setPreferencesSaved(true);
  };

  const persistNotifications = () => {
    saveStoredSettings(preferences, notifications);
    setNotificationsSaved(true);
  };

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Settings"
        title="Account settings"
        description="Manage your profile, security, preferences, and notification settings in one place."
        actions={
          <SegmentedControl
            value={section}
            onChange={setSection}
            options={[
              { value: "account", label: "Account" },
              { value: "security", label: "Security" },
              { value: "preferences", label: "Preferences" },
              { value: "notifications", label: "Notifications" },
            ]}
          />
        }
      />

      {flash ? <SettingsFlash tone={flash.status}>{flash.message}</SettingsFlash> : null}

      {section === "account" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <form action={saveProfileSettingsAction}>
            <SurfacePanel className="p-4 sm:p-5">
              <SectionHeader
                title="Profile information"
                description="Keep your contact details current so account and support updates reach the right person."
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="firstName"
                  defaultValue={initialProfile.firstName}
                  className={fieldClassName}
                  aria-label="First name"
                />
                <input
                  name="lastName"
                  defaultValue={initialProfile.lastName}
                  className={fieldClassName}
                  aria-label="Last name"
                />
                <input
                  defaultValue={initialProfile.email}
                  className={`${fieldClassName} cursor-not-allowed text-ink-muted`}
                  aria-label="Email"
                  disabled
                />
                <input
                  name="phone"
                  defaultValue={initialProfile.phone}
                  className={fieldClassName}
                  aria-label="Phone"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="reset"
                  className="theme-ghost-action rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Reset
                </button>
                <FormSubmitButton
                  idleLabel="Save profile"
                  pendingLabel="Saving profile..."
                />
              </div>
            </SurfacePanel>
          </form>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <UserRound size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">Account details</div>
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Your account email stays tied to your sign-in credentials.</div>
              <div>Use the phone field for billing and support follow-up.</div>
              <div>Profile updates apply to the portal right away.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      {section === "security" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_17rem]">
          <form action={changePasswordSettingsAction}>
            <SurfacePanel className="p-4 sm:p-5">
              <SectionHeader
                title="Password update"
                description="Update your password here to keep access to the portal secure."
              />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="Current password"
                  className={fieldClassName}
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New password"
                  className={fieldClassName}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className={fieldClassName}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="reset"
                  className="theme-ghost-action rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Clear
                </button>
                <FormSubmitButton
                  idleLabel="Update password"
                  pendingLabel="Updating password..."
                />
              </div>
            </SurfacePanel>
          </form>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon tone="soft">
                <ShieldCheck size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">Security notes</div>
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Use at least 8 characters with a strong combination of letters and numbers.</div>
              <div>Choose a password you are not using anywhere else.</div>
              <div>If you ever lose access, you can still recover it from the sign-in screen.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      {section === "preferences" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <SurfacePanel className="p-4 sm:p-5">
            <SectionHeader
              title="Preferences"
              description="Choose how the portal should look and behave on this device."
            />

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select
                className={fieldClassName}
                value={preferences.theme}
                onChange={(event) => {
                  setPreferencesSaved(false);
                  setPreferences((current) => ({
                    ...current,
                    theme: event.target.value as ThemePreference,
                  }));
                }}
              >
                <option value="light">Light appearance</option>
                <option value="dark">Dark appearance</option>
                <option value="system">System appearance</option>
              </select>
              <select
                className={fieldClassName}
                value={preferences.language}
                onChange={(event) => {
                  setPreferencesSaved(false);
                  setPreferences((current) => ({
                    ...current,
                    language: event.target.value as LocalePreference,
                  }));
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
              <select
                className={fieldClassName}
                value={preferences.timezone}
                onChange={(event) => {
                  setPreferencesSaved(false);
                  setPreferences((current) => ({
                    ...current,
                    timezone: event.target.value as TimezonePreference,
                  }));
                }}
              >
                <option value="america-tijuana">America/Tijuana</option>
                <option value="america-los-angeles">America/Los_Angeles</option>
              </select>
              <select
                className={fieldClassName}
                value={preferences.density}
                onChange={(event) => {
                  setPreferencesSaved(false);
                  setPreferences((current) => ({
                    ...current,
                    density: event.target.value as DensityPreference,
                  }));
                }}
              >
                <option value="comfortable">Comfortable density</option>
                <option value="compact">Compact density</option>
              </select>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreferences(defaultPreferences);
                  setPreferencesSaved(false);
                }}
                className="theme-ghost-action rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={persistPreferences}
                className="theme-cta inline-flex min-h-[2.85rem] items-center justify-center gap-2 rounded-[1rem] px-5 text-body-sm font-medium text-white"
              >
                <Save size={16} strokeWidth={1.8} />
                Save preferences
              </button>
            </div>

            {preferencesSaved ? (
              <div className="mt-4 text-body-sm text-success">
                Preferences saved for this device.
              </div>
            ) : null}
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon tone="soft">
                <SlidersHorizontal size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">On this device</div>
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Theme changes apply as soon as you save them.</div>
              <div>Language, timezone and density are stored for this browser.</div>
              <div>You can always switch the look again from the theme button in the header.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      {section === "notifications" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <SurfacePanel className="p-4 sm:p-5">
            <SectionHeader
              title="Notification preferences"
              description="Choose which updates the portal should keep front and center for you."
            />

            <div className="mt-4 space-y-3">
              {notificationsList.map((item) => (
                <ToggleRow
                  key={item.key}
                  title={item.title}
                  description={item.description}
                  checked={notifications[item.key]}
                  onToggle={() => {
                    setNotificationsSaved(false);
                    setNotifications((current) => ({
                      ...current,
                      [item.key]: !current[item.key],
                    }));
                  }}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setNotifications(defaultNotifications);
                  setNotificationsSaved(false);
                }}
                className="theme-ghost-action rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={persistNotifications}
                className="theme-cta inline-flex min-h-[2.85rem] items-center justify-center gap-2 rounded-[1rem] px-5 text-body-sm font-medium text-white"
              >
                <Bell size={16} strokeWidth={1.8} />
                Save notifications
              </button>
            </div>

            {notificationsSaved ? (
              <div className="mt-4 text-body-sm text-success">
                Notification preferences saved for this device.
              </div>
            ) : null}
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon tone="soft">
                <LockKeyhole size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">What you will see</div>
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Billing reminders help you stay ahead of invoices and charges.</div>
              <div>Outage alerts keep gateway events visible when they matter most.</div>
              <div>Promotional updates are optional and can stay off if you prefer less noise.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      <SurfacePanel subtle className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-body-md font-medium text-ink">Need help?</div>
            <div className="text-body-sm text-ink-muted">
              Visit the Help Center to review tickets, contact support, or submit a new request.
            </div>
          </div>

          <Link
            href="/support"
            className="theme-secondary-action inline-flex items-center justify-center rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
          >
            Open Help Center
          </Link>
        </div>
      </SurfacePanel>
    </div>
  );
}
