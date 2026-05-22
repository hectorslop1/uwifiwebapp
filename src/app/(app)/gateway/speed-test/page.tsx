import Link from "next/link";
import { Wifi } from "lucide-react";

import { FeedbackState } from "@/src/components/ui/feedback-state";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getGatewayOverviewData } from "@/src/server/gateway/api";

import { SpeedTestShell } from "./speed-test-shell";

export default async function GatewaySpeedTestPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const gateway = await getGatewayOverviewData(
    context.user.customerId,
    context.accessToken,
  );

  if (!gateway) {
    return (
      <div className="space-y-5 pb-2 lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
        <FeedbackState
          title="No gateway connected"
          description="Once this account has an active gateway, speed testing will be available here."
          icon={<Wifi size={22} strokeWidth={1.8} />}
          action={
            <Link
              href="/gateway"
              className="theme-control-button inline-flex items-center rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Back to gateway
            </Link>
          }
        />
      </div>
    );
  }

  return <SpeedTestShell gatewayIp={gateway.ipAddress} />;
}
