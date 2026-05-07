"use client";

import { cn } from "@/src/lib/cn";

export type ProgressiveBlurProps = {
  className?: string;
  height?: string;
  position?: "top" | "bottom" | "both";
  blurLevels?: number[];
};

export function ProgressiveBlur({
  className,
  height = "30%",
  position = "bottom",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
}: Readonly<ProgressiveBlurProps>) {
  const edgeOpacity = Math.min(0.22, 0.1 + blurLevels.length * 0.01);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 overflow-hidden",
        position === "top"
          ? "top-0"
          : position === "bottom"
            ? "bottom-0"
            : "inset-y-0",
        className,
      )}
      style={{
        height: position === "both" ? "100%" : height,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            position === "bottom"
              ? "linear-gradient(to bottom, rgba(var(--color-surface-raised),0) 0%, rgba(var(--color-surface-raised),0.36) 56%, rgba(var(--color-surface-raised),0.82) 84%, rgba(var(--color-surface-raised),0.96) 100%)"
              : position === "top"
                ? "linear-gradient(to top, rgba(var(--color-surface-raised),0) 0%, rgba(var(--color-surface-raised),0.36) 56%, rgba(var(--color-surface-raised),0.82) 84%, rgba(var(--color-surface-raised),0.96) 100%)"
                : "linear-gradient(180deg, rgba(var(--color-surface-raised),0.92) 0%, rgba(var(--color-surface-raised),0) 14%, rgba(var(--color-surface-raised),0) 86%, rgba(var(--color-surface-raised),0.94) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            position === "bottom"
              ? `inset 0 -24px 24px rgba(var(--color-surface-raised),${edgeOpacity})`
              : position === "top"
                ? `inset 0 24px 24px rgba(var(--color-surface-raised),${edgeOpacity})`
                : `inset 0 24px 24px rgba(var(--color-surface-raised),${Math.max(0.12, edgeOpacity - 0.04)}), inset 0 -24px 24px rgba(var(--color-surface-raised),${Math.max(0.14, edgeOpacity - 0.02)})`,
        }}
      />
    </div>
  );
}
