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
        "group flex min-h-[4rem] items-center gap-4 rounded-pill px-6 py-3 text-left transition-colors duration-200",
        subtleSurface && "bg-white/60",
        "text-ink-soft hover:bg-surface/70 hover:text-ink",
        className,
      )}
    >
      {/* Icon */}
      <span
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          subtleSurface
            ? "bg-canvas/65 text-ink-muted"
            : "bg-brand-soft/55 text-brand"
        )}
      >
        {icon ?? <span className="text-label-md">•</span>}
      </span>

      {/* Label */}
      <span className="min-w-0 flex-1 text-body-lg text-current">
        {label}
      </span>

      {/* Chevron */}
      <span
        aria-hidden="true"
        className="shrink-0 text-body-lg text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5"
      >
        ›
      </span>
    </Link>
  );
}
