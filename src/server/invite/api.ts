import "server-only";

import { uwifiServerConfig } from "@/src/server/uwifi/config";

export type InviteReferralData = {
  referralCode: string;
  referralLink: string;
};

export function getInviteReferralData(input: {
  customerId: number;
  sharedLinkId: string | null;
}) : InviteReferralData {
  const referralCode = (input.sharedLinkId || String(input.customerId)).trim();
  const referralLink = `${uwifiServerConfig.inviteBaseUrl}/${encodeURIComponent(referralCode)}`;

  return {
    referralCode,
    referralLink,
  };
}
