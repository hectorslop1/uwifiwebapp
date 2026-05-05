import "server-only";

import { cookies } from "next/headers";

import { getStoreProductById } from "@/src/lib/store-catalog";
import type {
  StoreCartCookieItem,
  StoreCartSnapshot,
  StoreCartState,
} from "@/src/lib/store-types";

const STORE_CART_COOKIE_NAME = "uwifi-store-cart";
const STORE_CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function normalizeQuantity(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(99, Math.floor(parsed)));
}

function normalizeStoreCartItems(items: unknown): StoreCartCookieItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const productId =
      "productId" in item && typeof item.productId === "string"
        ? item.productId
        : "";
    const quantity =
      "quantity" in item ? normalizeQuantity(item.quantity) : 0;

    if (!productId || quantity <= 0 || !getStoreProductById(productId)) {
      continue;
    }

    quantitiesByProductId.set(
      productId,
      (quantitiesByProductId.get(productId) ?? 0) + quantity,
    );
  }

  return Array.from(quantitiesByProductId.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );
}

function normalizeStoreCartState(value: unknown): StoreCartState {
  if (!value || typeof value !== "object") {
    return { items: [] };
  }

  return {
    items: normalizeStoreCartItems(
      "items" in value ? value.items : [],
    ),
  };
}

export async function readStoreCartState(): Promise<StoreCartState> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(STORE_CART_COOKIE_NAME)?.value;

  if (!rawValue) {
    return { items: [] };
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return normalizeStoreCartState(parsed);
  } catch {
    return { items: [] };
  }
}

export async function writeStoreCartState(state: StoreCartState) {
  const cookieStore = await cookies();

  cookieStore.set(
    STORE_CART_COOKIE_NAME,
    JSON.stringify(normalizeStoreCartState(state)),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: STORE_CART_COOKIE_MAX_AGE,
    },
  );
}

export async function clearStoreCartState() {
  const cookieStore = await cookies();
  cookieStore.delete(STORE_CART_COOKIE_NAME);
}

export async function mutateStoreCartState(
  updater: (current: StoreCartState) => StoreCartState,
) {
  const nextState = updater(await readStoreCartState());

  if (!nextState.items.length) {
    await clearStoreCartState();
    return { items: [] } as StoreCartState;
  }

  await writeStoreCartState(nextState);
  return nextState;
}

export async function getStoreCartSnapshot(): Promise<StoreCartSnapshot> {
  const state = await readStoreCartState();
  const quantitiesByProductId: Record<string, number> = {};

  const items = state.items
    .map((item) => {
      const product = getStoreProductById(item.productId);

      if (!product) {
        return null;
      }

      quantitiesByProductId[item.productId] = item.quantity;

      return {
        product,
        quantity: item.quantity,
        total: product.price * item.quantity,
      };
    })
    .filter(
      (
        item,
      ): item is StoreCartSnapshot["items"][number] => item !== null,
    );

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    itemCount,
    isEmpty: items.length === 0,
    quantitiesByProductId,
  };
}
