"use client";

import type { PortalUser } from "@/src/server/auth/types";

import { ContentCanvas } from "./content-canvas";
import { AppShellRowMotion } from "./app-shell-row-motion";
import { MobileNavProvider } from "./mobile-nav-context";
import { SidebarRail } from "./sidebar-rail";
import { TopUtilityBar } from "./top-utility-bar";

export function AppShell({
  user,
  children,
}: Readonly<{
  user: PortalUser;
  children: React.ReactNode;
}>) {
  return (
    <MobileNavProvider>
      <div className="theme-shell relative min-h-dvh overflow-x-hidden bg-[linear-gradient(180deg,#fbfaf7_0%,#f5f4ef_100%)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="theme-shell-orb-primary absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-white/90 blur-3xl" />
          <div className="theme-shell-orb-secondary absolute right-[-8rem] top-32 h-[30rem] w-[30rem] rounded-full bg-[#f0edf8] blur-3xl" />
          <div className="theme-shell-orb-tertiary absolute bottom-[-10rem] left-[22%] h-[24rem] w-[32rem] rounded-full bg-white/75 blur-3xl" />
        </div>

        <div className="relative flex min-h-dvh flex-col">
          <TopUtilityBar user={user} />

          <div className="flex flex-1 min-h-0">
            <AppShellRowMotion
              sidebar={<SidebarRail />}
              content={<ContentCanvas>{children}</ContentCanvas>}
            />
          </div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
