import type { PaymentMethod } from "@/src/server/billing/types";

export type WalletPointsSummary = {
  customerId: number;
  principalPoints: number;
  affiliatePoints: number;
  totalPoints: number;
  principalDollars: number;
  affiliateDollars: number;
  totalDollars: number;
  billingStart: string;
  billingEnd: string;
};

export type WalletHistoryEntry = {
  label: string;
  points: number;
};

export type WalletAffiliateUser = {
  customerId: number;
  customerName: string;
  isAffiliate: boolean;
  initials: string;
};

export type WalletDashboardData = {
  points: WalletPointsSummary;
  paymentMethods: PaymentMethod[];
  affiliatedUsers: WalletAffiliateUser[];
  weeklyHistory: WalletHistoryEntry[];
  monthlyHistory: WalletHistoryEntry[];
};
