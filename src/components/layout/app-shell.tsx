import { ContentCanvas } from "./content-canvas";
import { SidebarRail } from "./sidebar-rail";
import { TopUtilityBar } from "./top-utility-bar";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfaf7_0%,#f5f4ef_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute right-[-8rem] top-32 h-[30rem] w-[30rem] rounded-full bg-[#f0edf8] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[22%] h-[24rem] w-[32rem] rounded-full bg-white/75 blur-3xl" />
      </div>

      <div className="relative">
        <TopUtilityBar />

        <div className="mx-auto max-w-[1560px] lg:flex">
          <SidebarRail />

          <main className="min-w-0 flex-1">
            <ContentCanvas>{children}</ContentCanvas>
          </main>
        </div>
      </div>
    </div>
  );
}
