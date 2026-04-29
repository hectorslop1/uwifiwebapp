import type { ReactNode } from "react";

import { cn } from "@/src/lib/cn";

type FeedbackStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function FeedbackState({
  title,
  description,
  icon,
  action,
  className,
}: Readonly<FeedbackStateProps>) {
  return (
    <div
      className={cn(
        "flex min-h-[16rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line/70 bg-white/40 px-6 py-8 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-4 text-ink-faint">{icon}</div> : null}
      <div className="text-title-md text-ink">{title}</div>
      <p className="mt-2 max-w-[28rem] text-body-sm text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
