"use client";

import type { ReactNode } from "react";

type AppShellRowMotionProps = {
  sidebar: ReactNode;
  content: ReactNode;
};

export function AppShellRowMotion({
  sidebar,
  content,
}: Readonly<AppShellRowMotionProps>) {
  return (
    <div className="mx-auto max-w-[1560px] min-h-0 lg:flex lg:flex-1 lg:min-h-0 lg:items-stretch">
      <div>{sidebar}</div>

      <main className="min-w-0 flex flex-1 flex-col lg:min-h-0">{content}</main>
    </div>
  );
}
