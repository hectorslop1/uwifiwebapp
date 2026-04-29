"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { storeProducts } from "@/src/lib/mock-portal-data";

type Category = "All" | "Gateways" | "Mesh" | "Accessories" | "Services";

export function StoreShell() {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return storeProducts.filter((product) => {
      const matchesCategory =
        category === "All" ? true : product.category === category;
      const matchesQuery =
        normalized.length === 0
          ? true
          : `${product.name} ${product.description} ${product.category}`
              .toLowerCase()
              .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Store"
        title="U-Store"
        description="The store keeps the Flutter feature scope intact, but moves into a more curated product catalog: cleaner search, tighter cards and clearer hardware context."
        actions={<StatusPill label={`${products.length} items visible`} tone="brand" />}
      />

      <SurfacePanel className="p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:items-center">
          <div className="rounded-[1.4rem] border border-white/80 bg-white/55 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-3 text-ink-muted">
              <Search size={18} strokeWidth={1.8} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search hardware and services"
                className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          <SegmentedControl
            value={category}
            onChange={setCategory}
            options={[
              { value: "All", label: "All" },
              { value: "Gateways", label: "Gateways" },
              { value: "Mesh", label: "Mesh" },
              { value: "Accessories", label: "Accessories" },
              { value: "Services", label: "Services" },
            ]}
          />
        </div>
      </SurfacePanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <SurfacePanel key={product.id} className="p-5">
            <div className="rounded-[1.45rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,246,249,0.7))] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white/90 shadow-[0_18px_42px_rgba(198,202,212,0.16)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/85 text-ink-soft">
                  <ShoppingBag size={28} strokeWidth={1.7} />
                </span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-title-md text-ink">{product.name}</div>
                {product.featured ? <StatusPill label="Featured" tone="brand" /> : null}
              </div>
              <div className="mt-2 text-body-sm text-ink-muted">{product.description}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-pill bg-white/65 px-3 py-1.5 text-label-md text-ink-muted"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-label-md text-ink-muted">{product.category}</div>
                  <div className="mt-1 text-[1.75rem] font-medium tracking-[-0.05em] text-ink">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                <Link
                  href={`/store/${product.id}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
                >
                  View details
                  <ArrowRight size={16} strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          </SurfacePanel>
        ))}
      </div>
    </div>
  );
}
