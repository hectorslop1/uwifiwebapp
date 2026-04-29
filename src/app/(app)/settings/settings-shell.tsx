"use client";

import { useState } from "react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

type SettingsSection = "account" | "security" | "preferences" | "notifications";

const fieldClassName =
  "w-full rounded-[1rem] border border-white/80 bg-white/65 px-4 py-3 text-body-sm text-ink outline-none placeholder:text-ink-faint shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

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

export function SettingsShell() {
  const [section, setSection] = useState<SettingsSection>("account");
  const [notifications, setNotifications] = useState({
    billing: true,
    outages: true,
    promotions: false,
  });

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Settings"
        title="Account settings"
        description="All core settings from Flutter remain in scope: profile, security, preferences and notifications. The rewrite focuses on denser forms, quieter sections and clearer save behavior."
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

      {section === "account" ? (
        <SurfacePanel className="p-5 sm:p-6">
          <SectionHeader
            title="Profile information"
            description="Keep account information compact and scannable instead of spreading it into oversized form sections."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input defaultValue="Luc" className={fieldClassName} aria-label="First name" />
            <input defaultValue="Nguyen" className={fieldClassName} aria-label="Last name" />
            <input
              defaultValue="luc.nguyen@uwifi.com"
              className={fieldClassName}
              aria-label="Email"
            />
            <input
              defaultValue="+1 (555) 234-8890"
              className={fieldClassName}
              aria-label="Phone"
            />
          </div>
        </SurfacePanel>
      ) : null}

      {section === "security" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
          <SurfacePanel className="p-5 sm:p-6">
            <SectionHeader
              title="Password update"
              description="The security flow remains available, but the presentation is now calmer and more trustworthy."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input type="password" placeholder="Current password" className={fieldClassName} />
              <input type="password" placeholder="New password" className={fieldClassName} />
              <input
                type="password"
                placeholder="Confirm new password"
                className={fieldClassName}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-5">
            <SectionHeader
              title="Security notes"
              description="2FA, active sessions and recovery methods should live in this rail on the next backend-connected pass."
            />
          </SurfacePanel>
        </div>
      ) : null}

      {section === "preferences" ? (
        <SurfacePanel className="p-5 sm:p-6">
          <SectionHeader
            title="Preferences"
            description="Theme, language and time-related preferences remain part of the app web scope."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <select className={fieldClassName} defaultValue="light">
              <option value="light">Light appearance</option>
              <option value="system">System appearance</option>
            </select>
            <select className={fieldClassName} defaultValue="en">
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
            <select className={fieldClassName} defaultValue="america-tijuana">
              <option value="america-tijuana">America/Tijuana</option>
              <option value="america-los-angeles">America/Los_Angeles</option>
            </select>
            <select className={fieldClassName} defaultValue="comfortable">
              <option value="comfortable">Comfortable density</option>
              <option value="compact">Compact density</option>
            </select>
          </div>
        </SurfacePanel>
      ) : null}

      {section === "notifications" ? (
        <SurfacePanel className="p-5 sm:p-6">
          <SectionHeader
            title="Notification preferences"
            description="Billing, outage and promotional settings stay inside the experience instead of being dropped during the redesign."
          />

          <div className="mt-6 space-y-4">
            {[
              {
                key: "billing" as const,
                title: "Billing updates",
                description: "Invoices, failed charges and payment confirmations.",
              },
              {
                key: "outages" as const,
                title: "Gateway and outage alerts",
                description: "Connection issues, restarts and important service events.",
              },
              {
                key: "promotions" as const,
                title: "Offers and product news",
                description: "Optional updates about plans, hardware and bundles.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/75 bg-white/55 px-4 py-4"
              >
                <div>
                  <div className="text-body-md font-medium text-ink">{item.title}</div>
                  <div className="text-body-sm text-ink-muted">{item.description}</div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotifications((current) => ({
                      ...current,
                      [item.key]: !current[item.key],
                    }))
                  }
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    notifications[item.key] ? "bg-success/85" : "bg-line-strong/70"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                      notifications[item.key] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SurfacePanel>
      ) : null}

      <SurfacePanel subtle className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-body-md font-medium text-ink">Save bar</div>
            <div className="text-body-sm text-ink-muted">
              On the backend pass, this becomes sticky and only appears when values change.
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-pill border border-white/80 bg-white/60 px-4 py-2.5 text-body-sm text-ink-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-2.5 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
            >
              Save changes
            </button>
          </div>
        </div>
      </SurfacePanel>
    </div>
  );
}
