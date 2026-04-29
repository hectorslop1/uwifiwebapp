import { notFound } from "next/navigation";

import { ProductDetailShell } from "./product-detail-shell";
import { storeProducts } from "@/src/lib/mock-portal-data";

export default async function StoreProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = storeProducts.find((entry) => entry.id === productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailShell product={product} />;
}
