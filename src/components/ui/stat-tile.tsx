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
        "rounded-[1.35rem] border border-white/80 bg-white/60 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
        className,
      )}
    >
      <div className="text-label-md text-ink-muted">{label}</div>
      <div className="mt-2 text-[1.65rem] font-medium tracking-[-0.055em] text-ink">
        {value}
      </div>
      {meta ? <div className="mt-2 text-body-sm text-ink-muted">{meta}</div> : null}
    </div>
  );
}
