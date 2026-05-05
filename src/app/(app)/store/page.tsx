import { storeCatalog } from "@/src/lib/store-catalog";
import { getStoreCartSnapshot } from "@/src/server/store/cart";

import { StoreShell } from "./store-shell";
import { getStoreFlashMessage } from "./store-ui";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [query, cart] = await Promise.all([
    searchParams,
    getStoreCartSnapshot(),
  ]);

  return (
    <StoreShell
      products={storeCatalog}
      cart={cart}
      flash={getStoreFlashMessage(query)}
    />
  );
}
