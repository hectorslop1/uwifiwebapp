import { getPaymentMethods } from "@/src/server/billing/api";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getStoreCartSnapshot } from "@/src/server/store/cart";
import { getWalletPointsSummary } from "@/src/server/wallet/api";

import { CheckoutShell } from "./checkout-shell";
import { getStoreFlashMessage } from "../store-ui";

export default async function StoreCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, cart, paymentMethodsResult, walletPointsResult] =
    await Promise.all([
      searchParams,
      getStoreCartSnapshot(),
      getPaymentMethods(
        context.user.customerId,
        context.accessToken,
      )
        .then((paymentMethods) => ({
          paymentMethods,
          error: null as string | null,
        }))
        .catch((error: unknown) => ({
          paymentMethods: [],
          error:
            error instanceof Error
              ? error.message
              : "We couldn't load your saved cards right now.",
        })),
      getWalletPointsSummary(
        context.user.customerId,
        context.user.customerAffiliateId,
        context.accessToken,
      )
        .then((walletPoints) => ({
          walletPoints,
          error: null as string | null,
        }))
        .catch((error: unknown) => ({
          walletPoints: null,
          error:
            error instanceof Error
              ? error.message
              : "We couldn't load your U-Wallet points right now.",
        })),
    ]);

  return (
    <CheckoutShell
      cart={cart}
      paymentMethods={paymentMethodsResult.paymentMethods}
      walletPoints={walletPointsResult.walletPoints}
      flash={getStoreFlashMessage(query)}
      loadError={paymentMethodsResult.error ?? walletPointsResult.error}
    />
  );
}
