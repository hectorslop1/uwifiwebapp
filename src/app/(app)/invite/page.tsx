import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getInviteReferralData } from "@/src/server/invite/api";

import { InviteShell } from "./invite-shell";

export default async function InvitePage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const referral = getInviteReferralData({
    customerId: context.user.customerId,
    sharedLinkId: context.user.sharedLinkId,
  });

  return (
    <InviteShell
      referralCode={referral.referralCode}
      referralLink={referral.referralLink}
    />
  );
}
