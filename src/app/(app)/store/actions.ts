"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getStoreProductById,
  getStoreProductVariant,
} from "@/src/lib/store-catalog";
import {
  buildStoreCartLineId,
  parseStoreCartLineId,
} from "@/src/lib/store-types";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getPaymentMethods } from "@/src/server/billing/api";
import { getWalletPointsSummary } from "@/src/server/wallet/api";
import {
  clearStoreCartState,
  getStoreCartSnapshot,
  mutateStoreCartState,
} from "@/src/server/store/cart";

function getRedirectPath(formData: FormData, fallbackPath: string) {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  return redirectTo.startsWith("/") ? redirectTo : fallbackPath;
}

function getPathWithFlash(
  pathname: string,
  status: "success" | "error",
  message: string,
) {
  const params = new URLSearchParams({
    status,
    message,
  });

  return `${pathname}?${params.toString()}`;
}

function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value ?? fallback);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseQuantity(value: FormDataEntryValue | null) {
  return Math.max(0, Math.min(parseInteger(value, 0), 99));
}

function revalidateStorePaths(productId?: string) {
  revalidatePath("/store");
  revalidatePath("/store/checkout");

  if (productId) {
    revalidatePath(`/store/${productId}`);
    revalidatePath(`/store/product/${productId}`);
  }
}

export async function addStoreCartItemAction(formData: FormData) {
  const redirectTo = getRedirectPath(formData, "/store");
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = parseQuantity(formData.get("quantity"));
  const product = getStoreProductById(productId);

  if (!product) {
    redirect(
      getPathWithFlash(redirectTo, "error", "We couldn't find that product."),
    );
  }

  if (quantity <= 0) {
    redirect(
      getPathWithFlash(
        redirectTo,
        "error",
        "Choose a valid quantity before adding this item.",
      ),
    );
  }

  const variant = getStoreProductVariant(
    product,
    String(formData.get("variantId") ?? "").trim() || null,
  );
  const lineId = buildStoreCartLineId(productId, variant?.id);

  await mutateStoreCartState((current) => {
    const existing = current.items.find(
      (item) => buildStoreCartLineId(item.productId, item.variantId) === lineId,
    );

    if (existing) {
      return {
        items: current.items.map((item) =>
          buildStoreCartLineId(item.productId, item.variantId) === lineId
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, 99),
              }
            : item,
        ),
      };
    }

    return {
      items: [...current.items, { productId, quantity, variantId: variant?.id ?? null }],
    };
  });

  revalidateStorePaths(productId);

  redirect(
    getPathWithFlash(
      redirectTo,
      "success",
      `${product.name}${variant ? ` (${variant.name})` : ""} was added to your cart.`,
    ),
  );
}

export async function updateStoreCartQuantityAction(formData: FormData) {
  const redirectTo = getRedirectPath(formData, "/store/checkout");
  const parsedLine = parseStoreCartLineId(
    String(formData.get("lineId") ?? "").trim(),
  );
  const productId =
    parsedLine?.productId || String(formData.get("productId") ?? "").trim();
  const product = getStoreProductById(productId);

  if (!product) {
    redirect(
      getPathWithFlash(redirectTo, "error", "We couldn't find that product."),
    );
  }

  const delta = parseInteger(formData.get("delta"), 0);
  const explicitQuantity = parseQuantity(formData.get("quantity"));
  const resolvedVariant = getStoreProductVariant(product, parsedLine?.variantId);
  const targetLineId = buildStoreCartLineId(product.id, resolvedVariant?.id);

  await mutateStoreCartState((current) => {
    const existing = current.items.find(
      (item) => buildStoreCartLineId(item.productId, item.variantId) === targetLineId,
    );

    if (!existing) {
      return current;
    }

    const nextQuantity =
      delta !== 0
        ? Math.max(0, Math.min(existing.quantity + delta, 99))
        : explicitQuantity;

    return {
      items:
        nextQuantity <= 0
          ? current.items.filter(
              (item) =>
                buildStoreCartLineId(item.productId, item.variantId) !== targetLineId,
            )
          : current.items.map((item) =>
              buildStoreCartLineId(item.productId, item.variantId) === targetLineId
                ? { ...item, quantity: nextQuantity }
                : item,
            ),
    };
  });

  revalidateStorePaths(productId);
  redirect(redirectTo);
}

export async function removeStoreCartItemAction(formData: FormData) {
  const redirectTo = getRedirectPath(formData, "/store/checkout");
  const parsedLine = parseStoreCartLineId(
    String(formData.get("lineId") ?? "").trim(),
  );
  const productId =
    parsedLine?.productId || String(formData.get("productId") ?? "").trim();
  const product = getStoreProductById(productId);
  const resolvedVariant = product
    ? getStoreProductVariant(product, parsedLine?.variantId)
    : null;
  const targetLineId = buildStoreCartLineId(productId, resolvedVariant?.id);

  await mutateStoreCartState((current) => ({
    items: current.items.filter(
      (item) => buildStoreCartLineId(item.productId, item.variantId) !== targetLineId,
    ),
  }));

  revalidateStorePaths(productId);
  redirect(getPathWithFlash(redirectTo, "success", "The item was removed."));
}

export async function clearStoreCartAction(formData: FormData) {
  const redirectTo = getRedirectPath(formData, "/store");

  await clearStoreCartState();
  revalidateStorePaths();

  redirect(getPathWithFlash(redirectTo, "success", "Your cart is now empty."));
}

export async function completeStoreCheckoutAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const redirectTo = getRedirectPath(formData, "/store");
  const snapshot = await getStoreCartSnapshot();

  if (snapshot.isEmpty) {
    redirect(
      getPathWithFlash(
        "/store",
        "error",
        "Add at least one item before continuing to checkout.",
      ),
    );
  }

  const selectedCardId = parseInteger(formData.get("selectedCardId"), 0);
  const usePoints = String(formData.get("usePoints") ?? "0") === "1";

  const [paymentMethods, walletPoints] = await Promise.all([
    getPaymentMethods(context.user.customerId, context.accessToken),
    getWalletPointsSummary(
      context.user.customerId,
      context.user.customerAffiliateId,
      context.accessToken,
    ).catch(() => null),
  ]);

  const pointsDiscount = usePoints
    ? Math.min(walletPoints?.totalDollars ?? 0, snapshot.subtotal)
    : 0;
  const total = Math.max(0, snapshot.subtotal - pointsDiscount);

  if (total > 0) {
    const validCard = paymentMethods.some((method) => method.id === selectedCardId);

    if (!validCard) {
      redirect(
        getPathWithFlash(
          redirectTo,
          "error",
          "Select a saved card before placing your order.",
        ),
      );
    }
  }

  await clearStoreCartState();
  revalidateStorePaths();

  redirect(
    getPathWithFlash(
      "/store",
      "success",
      "Your order was placed successfully.",
    ),
  );
}
