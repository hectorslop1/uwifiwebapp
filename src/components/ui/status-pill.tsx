"use client";

import type { ReactNode } from "react";

import { StatusBeacon } from "@/src/components/magic/status-beacon";
import { cn } from "@/src/lib/cn";

type StatusTone = "success" | "brand" | "muted" | "warning";

type StatusVariant = "soft" | "plain";

type ToneMap = Record<StatusVariant, string>;

const toneMap: Record<StatusTone | "error", ToneMap> = {
  success: {
    soft: "bg-success-soft text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    plain: "bg-transparent text-success",
  },
  brand: {
    soft: "bg-brand-soft text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    plain: "bg-transparent text-brand",
  },
  muted: {
    soft: "theme-status-muted bg-[#f7f8fa] text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    plain: "bg-transparent text-ink-soft",
  },
  warning: {
    soft: "theme-status-warning bg-[#f8f0df] text-[#996a16] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    plain: "bg-transparent text-[#996a16]",
  },
  error: {
    soft: "bg-[#fff4f2] text-[#d95b49] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    plain: "bg-transparent text-[#d95b49]",
  },
};

type StatusPillProps = {
  label: ReactNode;
  tone?: StatusTone | "error";
  pulse?: boolean;
  variant?: StatusVariant;
  className?: string;
};

export function StatusPill({
  label,
  tone = "muted",
  pulse = false,
  variant = "soft",
  className,
}: Readonly<StatusPillProps>) {
  return (
    <span
      className={cn(
        variant === "plain"
          ? "inline-flex items-center gap-2 text-label-md"
          : "inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-label-md",
        toneMap[tone][variant],
        className,
      )}
    >
      {pulse ? (
        <StatusBeacon
          active={tone !== "warning" && tone !== "error"}
          className="h-3.5 w-3.5"
        />
      ) : (
        <span className="h-2 w-2 rounded-full bg-current/80" />
      )}
      {label}
    </span>
  );
}
