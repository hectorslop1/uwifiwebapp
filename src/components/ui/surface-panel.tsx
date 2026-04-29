import type { HTMLAttributes } from "react";

import { cn } from "@/src/lib/cn";

type SurfacePanelProps = HTMLAttributes<HTMLDivElement> & {
  subtle?: boolean;
};

export function SurfacePanel({
  className,
  subtle = false,
  ...props
}: Readonly<SurfacePanelProps>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] border border-white/80 backdrop-blur-xl",
        subtle
          ? "theme-panel-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,248,250,0.72))] shadow-[0_18px_38px_rgba(205,207,214,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]"
          : "theme-panel bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(247,247,249,0.8))] shadow-[0_22px_48px_rgba(205,207,214,0.11),inset_0_1px_0_rgba(255,255,255,0.92)]",
        className,
      )}
      {...props}
    />
  );
}
