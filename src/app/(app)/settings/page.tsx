import { getPortalNotifications } from "@/src/server/notifications/api";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getSettingsProfile } from "@/src/server/settings/api";

import {
  getSettingsFlashMessage,
  getSettingsSection,
} from "./settings-ui";
import { SettingsShell } from "./settings-shell";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, profileResult, notificationsResult] = await Promise.all([
    searchParams,
    getSettingsProfile(context.user.customerId, context.accessToken),
    getPortalNotifications(context.user.customerId, context.accessToken).catch(() => []),
  ]);

  const profile = profileResult;

  return (
    <SettingsShell
      key={`${getSettingsSection(query.section)}-${query.status ?? "idle"}-${query.message ?? "none"}`}
      initialProfile={profile}
      initialSection={getSettingsSection(query.section)}
      flash={getSettingsFlashMessage(query)}
      initialNotifications={notificationsResult}
    />
  );
}
