import type { ReactNode } from "react";

import { cn } from "@/src/lib/cn";

type StatTileProps = {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function StatTile({
  label,
  value,
  meta,
  className,
}: Readonly<StatTileProps>) {
  return (
    <div
      className={cn(
        "theme-inline-surface rounded-[1.25rem] border border-white/80 bg-white/60 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
        className,
      )}
    >
      <div className="text-label-md text-ink-muted">{label}</div>
      <div className="mt-1.5 text-[1.45rem] font-medium tracking-[-0.055em] text-ink">
        {value}
      </div>
      {meta ? <div className="mt-1.5 text-[0.82rem] text-ink-muted">{meta}</div> : null}
    </div>
  );
}
