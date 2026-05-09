import type { ReactNode } from "react";

import { cn } from "@/src/lib/cn";

type PageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageIntro({
  title,
  description,
  eyebrow,
  actions,
  className,
}: Readonly<PageIntroProps>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-[40rem] space-y-1.5">
        {eyebrow ? (
          <div className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
            {eyebrow}
          </div>
        ) : null}

        <h1 className="wrap-anywhere text-[1.72rem] font-medium tracking-[-0.06em] text-ink sm:text-[2rem]">
          {title}
        </h1>

        <p className="max-w-[36rem] text-[0.92rem] leading-6 text-ink-muted">
          {description}
        </p>
      </div>

      {actions ? <div className="flex flex-wrap items-stretch gap-3 sm:items-center">{actions}</div> : null}
    </div>
  );
}
