import type { PaymentMethod } from "@/src/server/billing/types";
import type { WalletPointsSummary } from "@/src/server/wallet/types";

import type { ProductVariant, StoreProduct } from "./store-catalog";

export type StoreCartCookieItem = {
  productId: string;
  quantity: number;
  variantId?: string | null;
};

export type StoreCartState = {
  items: StoreCartCookieItem[];
};

export type StoreCartLineItem = {
  id: string;
  product: StoreProduct;
  variant: ProductVariant | null;
  unitPrice: number;
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

export function buildStoreCartLineId(productId: string, variantId?: string | null) {
  return `${productId}::${variantId || "default"}`;
}

export function parseStoreCartLineId(lineId: string) {
  const [productId = "", rawVariantId = ""] = lineId.split("::");

  if (!productId) {
    return null;
  }

  return {
    productId,
    variantId: rawVariantId && rawVariantId !== "default" ? rawVariantId : null,
  };
}
