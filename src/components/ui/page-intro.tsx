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
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-[42rem] space-y-2">
        {eyebrow ? (
          <div className="text-label-sm uppercase tracking-[0.18em] text-ink-faint">
            {eyebrow}
          </div>
        ) : null}

        <h1 className="text-[2rem] font-medium tracking-[-0.06em] text-ink sm:text-[2.35rem]">
          {title}
        </h1>

        <p className="max-w-[38rem] text-body-md text-ink-muted">
          {description}
        </p>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
