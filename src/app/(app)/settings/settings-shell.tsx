"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Bell,
  CheckCheck,
  Languages,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { PortalNotification } from "@/src/server/notifications/types";
import type { SettingsProfile } from "@/src/server/settings/types";

import {
  changePasswordSettingsAction,
  deleteNotificationSettingsAction,
  markAllNotificationsAsReadSettingsAction,
  markNotificationAsReadSettingsAction,
} from "./actions";
import type { SettingsFlashMessage, SettingsSection } from "./settings-ui";

const fieldClassName =
  "theme-input w-full rounded-[1rem] border px-4 py-3 text-body-sm text-ink outline-none placeholder:text-ink-faint";

const settingsKey = "uwifi-settings-v2";

type ThemePreference = "light" | "dark" | "system";
type LocalePreference = "en" | "es";
type NotificationFilter = "all" | "unread" | "read";

type PortalPreferences = {
  theme: ThemePreference;
  language: LocalePreference;
};

const defaultPreferences: PortalPreferences = {
  theme: "system",
  language: "en",
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

function ReadOnlyField({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="theme-inline-surface rounded-[1rem] border border-line/35 px-4 py-3">
      <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="mt-1.5 break-words text-body-md font-medium text-ink-soft">
        {value || "Not available"}
      </div>
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
  document.documentElement.lang = preferences.language;
  window.localStorage.setItem("uwifi-theme", preferences.theme);
}

function saveStoredSettings(preferences: PortalPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(settingsKey, JSON.stringify({ preferences }));
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getNotificationTone(priority: string) {
  const normalized = priority.trim().toLowerCase();

  if (normalized === "high" || normalized === "urgent") {
    return "warning" as const;
  }

  return "brand" as const;
}

export function SettingsShell({
  initialProfile,
  initialSection,
  flash,
  initialNotifications,
}: Readonly<{
  initialProfile: SettingsProfile;
  initialSection: SettingsSection;
  flash: SettingsFlashMessage | null;
  initialNotifications: PortalNotification[];
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
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationFilter>("all");

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

  const unreadCount = useMemo(
    () => initialNotifications.filter((entry) => !entry.isRead).length,
    [initialNotifications],
  );

  const filteredNotifications = useMemo(() => {
    if (notificationFilter === "unread") {
      return initialNotifications.filter((entry) => !entry.isRead);
    }

    if (notificationFilter === "read") {
      return initialNotifications.filter((entry) => entry.isRead);
    }

    return initialNotifications;
  }, [initialNotifications, notificationFilter]);

  const persistPreferences = () => {
    applyPreferences(preferences);
    saveStoredSettings(preferences);
    setPreferencesSaved(true);
  };

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Settings"
        title="Account settings"
        description="Manage your account details, security, preferences, and notifications in one place."
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
        <SurfacePanel className="p-4 sm:p-5">
          <SectionHeader
            title="Account overview"
            description="Review the key contact details connected to your account."
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ReadOnlyField label="First name" value={initialProfile.firstName} />
            <ReadOnlyField label="Last name" value={initialProfile.lastName} />
            <ReadOnlyField label="Email" value={initialProfile.email} />
            <ReadOnlyField label="Phone" value={initialProfile.phone} />
          </div>

          <div className="mt-4 text-body-sm text-ink-muted">
            Keep these details current so billing notices, service updates, and account recovery reach the right place.
          </div>
        </SurfacePanel>
      ) : null}

      {section === "security" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_17rem]">
          <form action={changePasswordSettingsAction}>
            <SurfacePanel className="p-4 sm:p-5">
              <SectionHeader
                title="Update password"
                description="Update your password here to keep account access secure."
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
                  className={`${fieldClassName} md:col-span-2`}
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
              <div>Use at least 8 characters with a stronger mix of upper-case letters, numbers and symbols.</div>
              <div>Choose a password you are not using anywhere else.</div>
              <div>If you lose access later, recovery still starts from the sign-in screen.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      {section === "preferences" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <SurfacePanel className="p-4 sm:p-5">
            <SectionHeader
              title="Preferences"
              description="Set your preferred appearance and language for this portal experience."
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
                Preferences saved for this browser.
              </div>
            ) : null}
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon tone="soft">
                <Languages size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">On this browser</div>
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Theme changes apply as soon as you save them.</div>
              <div>Language preference stays stored locally for this portal session.</div>
              <div>Your saved choices help keep this experience consistent each time you return.</div>
            </div>
          </SurfacePanel>
        </div>
      ) : null}

      {section === "notifications" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <SurfacePanel className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                title="Notifications"
                description="Review recent alerts, filter what matters, and clear items as needed."
              />

              {unreadCount > 0 ? (
                <form action={markAllNotificationsAsReadSettingsAction}>
                  <button
                    type="submit"
                    className="theme-control-button inline-flex min-h-[2.8rem] items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <CheckCheck size={16} strokeWidth={1.8} />
                    Mark all read
                  </button>
                </form>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {([
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
                { value: "read", label: "Read" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setNotificationFilter(option.value)}
                  className={`rounded-full border px-3.5 py-2 text-[0.82rem] font-medium transition-all duration-200 ${
                    notificationFilter === option.value
                      ? "border-[rgba(52,196,59,0.22)] bg-[rgba(52,196,59,0.12)] text-success"
                      : "theme-control-button"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {filteredNotifications.length ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`theme-inline-surface rounded-[1.15rem] border px-4 py-3.5 ${
                      notification.isRead
                        ? "border-line/35"
                        : "border-[rgba(52,196,59,0.2)] bg-[rgba(248,255,249,0.88)]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-body-md font-medium text-ink">
                            {notification.categoryName}
                          </div>
                          <StatusPill
                            label={notification.isRead ? "Read" : "Unread"}
                            tone={notification.isRead ? "muted" : "success"}
                          />
                          <StatusPill
                            label={notification.priority}
                            tone={getNotificationTone(notification.priority)}
                          />
                        </div>
                        <div className="mt-2 text-body-sm text-ink-soft">
                          {notification.message}
                        </div>
                        <div className="mt-2 text-[0.8rem] text-ink-faint">
                          {formatNotificationDate(notification.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!notification.isRead ? (
                          <form action={markNotificationAsReadSettingsAction}>
                            <input type="hidden" name="notificationId" value={notification.id} />
                            <button
                              type="submit"
                              className="theme-control-button inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8rem] font-medium transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <CheckCheck size={14} strokeWidth={1.8} />
                              Mark read
                            </button>
                          </form>
                        ) : null}

                        <form action={deleteNotificationSettingsAction}>
                          <input type="hidden" name="notificationId" value={notification.id} />
                          <button
                            type="submit"
                            className="theme-control-button inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8rem] font-medium transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <Trash2 size={14} strokeWidth={1.8} />
                            Delete
                          </button>
                        </form>

                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="theme-inline-surface rounded-[1.15rem] border border-line/35 px-4 py-4 text-body-sm text-ink-muted">
                  No notifications match this filter yet.
                </div>
              )}
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-3">
              <SectionIcon tone="soft">
                <Bell size={18} strokeWidth={1.8} />
              </SectionIcon>
              <div className="text-title-md text-ink">Notification summary</div>
            </div>
            <div className="mt-4 grid gap-2.5">
              <ReadOnlyField label="Total" value={String(initialNotifications.length)} />
              <ReadOnlyField label="Unread" value={String(unreadCount)} />
            </div>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <div>Unread items can be marked individually or all at once.</div>
              <div>Clear older items anytime to keep this feed focused on current updates.</div>
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
