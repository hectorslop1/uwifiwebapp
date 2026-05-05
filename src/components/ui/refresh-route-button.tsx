"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";

import { cn } from "@/src/lib/cn";

export function RefreshRouteButton({
  label = "Refresh",
  className,
}: Readonly<{
  label?: string;
  className?: string;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
      disabled={isPending}
      className={cn(
        "theme-control-button inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-body-sm transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      <RefreshCw
        size={15}
        strokeWidth={1.8}
        className={isPending ? "animate-spin" : undefined}
      />
      {isPending ? "Refreshing..." : label}
    </button>
  );
}
