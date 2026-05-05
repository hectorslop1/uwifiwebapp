import { FeedbackState } from "@/src/components/ui/feedback-state";
import { PageIntro } from "@/src/components/ui/page-intro";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getGatewayOverviewData } from "@/src/server/gateway/api";

import { getGatewayFlashMessage } from "../gateway-ui";
import { WifiSettingsShell } from "./wifi-settings-shell";

export default async function GatewayWifiPage({
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
      <div className="space-y-5 pb-2 lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
        <PageIntro
          eyebrow="Gateway"
          title="Wi‑Fi settings"
          description="Update your network names and passwords for both Wi‑Fi bands."
        />
        <FeedbackState
          title="No gateway connected"
          description="Once this account has an active gateway, Wi‑Fi settings will appear here."
        />
      </div>
    );
  }

  return <WifiSettingsShell initialGateway={gateway} flash={flash} />;
}
