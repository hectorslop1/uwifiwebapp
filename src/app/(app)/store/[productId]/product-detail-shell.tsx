"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, ShieldCheck } from "lucide-react";

import { InteractiveHoverButtonLink } from "@/src/components/magic/interactive-hover-button";
import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";
import { KeyValueList } from "@/src/components/ui/key-value-list";
import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { StoreProduct } from "@/src/lib/mock-portal-data";

export function ProductDetailShell({
  product,
}: Readonly<{
  product: StoreProduct;
}>) {
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(() => product.price * quantity, [product.price, quantity]);

  return (
    <div className="space-y-5">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Back to store
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
        <SurfacePanel className="p-5 sm:p-6">
          <PageIntro
            eyebrow={product.category}
            title={product.name}
            description={product.description}
            actions={<StatusPill label={product.leadTime} tone="success" />}
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div className="rounded-[1.6rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,246,249,0.72))] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
              <div className="mx-auto flex h-[18rem] w-full max-w-[16rem] items-end justify-center">
                <div className="relative h-[14rem] w-[9.5rem] rounded-[2.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_35%,#edeef2_100%)] shadow-[0_40px_70px_rgba(201,205,214,0.18),inset_10px_0_28px_rgba(213,216,224,0.24),inset_-12px_0_30px_rgba(255,255,255,0.96)]">
                  <div className="absolute inset-x-5 bottom-6 top-6 rounded-[2rem] border border-white/55" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <SurfacePanel subtle className="p-5">
                <div className="text-title-md text-ink">Why it exists</div>
                <div className="mt-3 text-body-sm text-ink-muted">
                  {product.compatibility}
                </div>
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
              </SurfacePanel>

              <SurfacePanel subtle className="p-5">
                <div className="text-title-md text-ink">Specification summary</div>
                <div className="mt-4">
                  <KeyValueList
                    items={[
                      { label: "Category", value: product.category },
                      { label: "Lead time", value: product.leadTime },
                      { label: "Compatibility", value: product.compatibility },
                      { label: "Install support", value: "Available" },
                    ]}
                  />
                </div>
              </SurfacePanel>
            </div>
          </div>
        </SurfacePanel>

        <div className="space-y-5">
          <SurfacePanel subtle className="p-5">
            <div className="text-label-md uppercase tracking-[0.14em] text-ink-faint">
              Order summary
            </div>
            <div className="mt-3 text-[2.25rem] font-medium tracking-[-0.06em] text-ink">
              ${total.toFixed(2)}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-pill border border-white/80 bg-white/60 px-3 py-2.5">
              <span className="text-body-sm text-ink-muted">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft"
                >
                  <Minus size={15} strokeWidth={1.8} />
                </button>
                <span className="w-8 text-center text-body-sm text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft"
                >
                  <Plus size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <InteractiveHoverButtonLink
              href="/store/checkout"
              className="mt-5 block rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-center text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)]"
              containerClassName="mt-5 rounded-pill"
            >
              Continue to checkout
            </InteractiveHoverButtonLink>

            <div className="mt-4 flex items-start gap-3 rounded-[1.15rem] bg-white/50 px-4 py-4 text-body-sm text-ink-muted">
              <ShieldCheck size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-success" />
              Clean trust block for shipping, setup and billing safety instead of generic e-commerce noise.
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-5">
            <div className="text-title-md text-ink">Related actions</div>
            <ActionCapsules className="mt-4">
              <ActionCapsule href="/wallet" label="Review U-Wallet balance" />
              <ActionCapsule href="/billing/payment-methods" label="Check payment method" />
              <ActionCapsule href="/gateway" label="Compare with current gateway" />
            </ActionCapsules>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
