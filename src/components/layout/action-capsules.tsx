import type { ReactNode } from "react";
import Link from "next/link";

type ActionCapsulesProps = {
  children: ReactNode;
  className?: string;
};

type ActionCapsuleProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  subtleSurface?: boolean;
  className?: string;
};

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function ActionCapsules({
  children,
  className,
}: Readonly<ActionCapsulesProps>) {
  return (
    <nav
      aria-label="Context navigation"
      className={cx("flex flex-col gap-3", className)}
    >
      {children}
    </nav>
  );
}

export function ActionCapsule({
  href,
  label,
  icon,
  subtleSurface = true,
  className,
}: Readonly<ActionCapsuleProps>) {
  return (
    <Link
      href={href}
      className={cx(
        "theme-control-button group flex min-h-[3.35rem] items-center gap-3 rounded-pill border px-4 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5",
        subtleSurface &&
          "theme-inline-surface border border-[#e2eadf] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,250,244,0.9))] shadow-[0_14px_28px_rgba(214,209,199,0.1),inset_0_1px_0_rgba(255,255,255,0.94)] hover:bg-[linear-gradient(180deg,rgba(248,255,247,1),rgba(235,248,233,0.94))] hover:shadow-[0_18px_34px_rgba(203,211,198,0.16),inset_0_1px_0_rgba(255,255,255,0.96)]",
        "text-ink-soft hover:text-ink",
        className,
      )}
    >
      {/* Icon */}
      <span
        className={cx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          subtleSurface
            ? "theme-icon-surface bg-canvas/70 text-ink-muted group-hover:bg-[linear-gradient(180deg,rgba(241,251,243,0.98),rgba(229,247,233,0.95))] group-hover:text-success"
            : "bg-brand-soft/55 text-brand"
        )}
      >
        {icon ?? <span className="text-label-md">•</span>}
      </span>

      {/* Label */}
      <span className="min-w-0 flex-1 text-[0.95rem] text-current">
        {label}
      </span>

      {/* Chevron */}
      <span
        aria-hidden="true"
        className="shrink-0 text-[1rem] text-ink-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink-soft"
      >
        ›
      </span>
    </Link>
  );
}
