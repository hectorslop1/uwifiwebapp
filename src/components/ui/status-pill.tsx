import type { ReactNode } from "react";

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
  className?: string;
};

export function StatusPill({
  label,
  tone = "muted",
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
      <span className="h-2 w-2 rounded-full bg-current/80" />
      {label}
    </span>
  );
}
