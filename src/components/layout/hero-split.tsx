import type { ReactNode } from "react";

import { NumberTicker } from "@/src/components/magic/number-ticker";
import { TextReveal } from "@/src/components/magic/text-reveal";

type HeroSplitProps = {
  left: ReactNode;
  right: ReactNode;
  className?: string;
};

type MetricStackProps = {
  status: string;
  amount: string;
  billingLabel: string;
  billingValue: string;
  statusTone?: "success" | "brand" | "muted";
  className?: string;
};

type ObjectStageProps = {
  children?: ReactNode;
  className?: string;
  align?: "center" | "end";
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function HeroSplit({ left, right, className }: HeroSplitProps) {
  return (
    <section
      className={cx(
        // 🔥 MENOS altura + sin padding vertical excesivo
        "grid min-h-[28rem] items-center gap-hero-gap",
        "lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]",
        "lg:pl-12",
        className
      )}
    >
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </section>
  );
}

export function MetricStack({
  status,
  amount,
  billingLabel,
  billingValue,
  statusTone = "success",
  className,
}: MetricStackProps) {
  const statusToneClass =
    statusTone === "success"
      ? "bg-success"
      : statusTone === "brand"
      ? "bg-brand"
      : "bg-line-strong";
  const numericAmount = Number(amount.replace(/[^0-9.-]/g, ""));
  const amountPrefix = amount.trim().startsWith("$") ? "$" : "";

  return (
    <div
      className={cx(
        // 🔥 menos separación vertical (antes era muy grande)
        "flex max-w-[24rem] flex-col justify-center space-y-8 lg:max-w-[25rem]",
        className
      )}
    >
      {/* Status */}
      <div className="flex items-center gap-3 text-body-md text-ink-muted">
        <span className={cx("h-2.5 w-2.5 rounded-full", statusToneClass)} />
        <TextReveal text={status} />
      </div>

      {/* Main metric */}
      <div className="space-y-5">
        {/* 🔥 CAMBIO CLAVE: más presencia */}
        <div className="text-[4.5rem] font-semibold tracking-tight">
          {Number.isFinite(numericAmount) ? (
            <NumberTicker
              value={numericAmount}
              prefix={amountPrefix}
              decimals={amount.includes(".") ? 2 : 0}
            />
          ) : (
            amount
          )}
        </div>

        <div className="space-y-3">
          <div className="text-body-lg text-ink-muted">{billingLabel}</div>
          <div className="text-title-xl text-ink">{billingValue}</div>
        </div>
      </div>
    </div>
  );
}

export function ObjectStage({
  children,
  className,
  align = "center",
}: ObjectStageProps) {
  return (
    <div
      className={cx(
        // 🔥 MENOS altura y padding
        "relative flex w-full items-center px-4 lg:px-8",
        "min-h-[30rem] lg:min-h-[34rem]",
        align === "end" ? "justify-center lg:justify-end pr-16" : "justify-center",
        className
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        {children ?? (
          <span className="text-label-md text-ink-faint">
            Image area
          </span>
        )}
      </div>
    </div>
  );
}
