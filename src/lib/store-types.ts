import type { PaymentMethod } from "@/src/server/billing/types";
import type { WalletPointsSummary } from "@/src/server/wallet/types";

import type { StoreProduct } from "./store-catalog";

export type StoreCartCookieItem = {
  productId: string;
  quantity: number;
};

export type StoreCartState = {
  items: StoreCartCookieItem[];
};

export type StoreCartLineItem = {
  product: StoreProduct;
  quantity: number;
  total: number;
};

export type StoreCartSnapshot = {
  items: StoreCartLineItem[];
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;
  quantitiesByProductId: Record<string, number>;
};

export type StoreCheckoutSnapshot = {
  cart: StoreCartSnapshot;
  paymentMethods: PaymentMethod[];
  walletPoints: WalletPointsSummary | null;
  loadError: string | null;
};
