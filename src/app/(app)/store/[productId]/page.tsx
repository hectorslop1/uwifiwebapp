import { notFound } from "next/navigation";

import { getStoreProductById } from "@/src/lib/store-catalog";
import { getStoreCartSnapshot } from "@/src/server/store/cart";

import { ProductDetailShell } from "./product-detail-shell";
import { getStoreFlashMessage } from "../store-ui";

export default async function StoreProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ productId }, query, cart] = await Promise.all([
    params,
    searchParams,
    getStoreCartSnapshot(),
  ]);
  const product = getStoreProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailShell
      product={product}
      cartQuantity={cart.quantitiesByProductId[product.id] ?? 0}
      cart={cart}
      flash={getStoreFlashMessage(query)}
    />
  );
}
