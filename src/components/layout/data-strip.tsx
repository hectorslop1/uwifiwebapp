import type { ReactNode } from "react";

type DataStripProps = {
  children: ReactNode;
  className?: string;
};

type DataStripClusterProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
};

type DataStripItemProps = {
  label: string;
  value: ReactNode;
  valueTone?: "default" | "soft" | "muted" | "success" | "brand";
  className?: string;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function DataStrip({ children, className }: DataStripProps) {
  return (
    <section
      className={cx(
        "flex flex-col gap-section-gap py-8",
        "lg:flex-row lg:items-start lg:gap-12 xl:gap-16",
        className
      )}
    >
      {children}
    </section>
  );
}

export function DataStripCluster({
  children,
  className,
  align = "start",
}: DataStripClusterProps) {
  return (
    <div
      className={cx(
        "min-w-0 flex-1 space-y-6",
        align === "center"
          ? "text-center"
          : align === "end"
          ? "text-right"
          : "text-left",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DataStripItem({
  label,
  value,
  valueTone = "default",
  className,
}: DataStripItemProps) {
  const valueToneClass =
    valueTone === "success"
      ? "text-success"
      : valueTone === "brand"
      ? "text-brand"
      : valueTone === "soft"
      ? "text-ink-soft"
      : valueTone === "muted"
      ? "text-ink-muted"
      : "text-ink";

  return (
    <div className={cx("space-y-2", className)}>
      <div className="text-label-md text-ink-muted">{label}</div>
      <div className={cx("text-title-md tracking-tight", valueToneClass)}>
        {value}
      </div>
    </div>
  );
}

export function DataStripDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "hidden w-px self-stretch bg-line/40 lg:block",
        className
      )}
    />
  );
}