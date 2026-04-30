"use client";

import type { ReactNode } from "react";

import { StatusBeacon } from "@/src/components/magic/status-beacon";
import { cn } from "@/src/lib/cn";

type StatusTone = "success" | "brand" | "muted" | "warning";

const toneMap: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  brand: "bg-brand-soft text-brand",
  muted: "theme-status-muted bg-[#f1f2f5] text-ink-soft",
  warning: "theme-status-warning bg-[#fff4df] text-[#b67a17]",
};

type StatusPillProps = {
  label: ReactNode;
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
};

export function StatusPill({
  label,
  tone = "muted",
  pulse = false,
  className,
}: Readonly<StatusPillProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-label-md",
        toneMap[tone],
        className,
      )}
    >
      {pulse ? (
        <StatusBeacon active={tone !== "warning"} className="h-3.5 w-3.5" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-current/80" />
      )}
      {label}
    </span>
  );
}
