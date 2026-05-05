import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getWalletDashboardData } from "@/src/server/wallet/api";

import { WalletShell } from "./wallet-shell";

export default async function WalletPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const dashboard = await getWalletDashboardData(
    context.user.customerId,
    context.user.customerAffiliateId,
    context.accessToken,
  );

  return (
    <WalletShell
      dashboard={dashboard}
      currentUser={{
        customerId: context.user.customerId,
        fullName: context.user.fullName,
      }}
    />
  );
}
