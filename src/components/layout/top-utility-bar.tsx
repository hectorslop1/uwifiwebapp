import { ChevronDown } from "lucide-react";

import { AnimatedThemeToggler } from "@/src/components/magic/animated-theme-toggler";

import { UwifiBrandTile } from "./uwifi-brand";

export function TopUtilityBar() {
  return (
    <header className="relative z-40 border-b border-white/80 bg-white/55 backdrop-blur-[22px]">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8">
        <div className="hidden lg:flex lg:w-[14rem] lg:shrink-0 lg:items-center">
          <UwifiBrandTile
            className="h-[3.35rem] w-[3.35rem]"
            imageClassName="w-[2.4rem]"
          />
        </div>

        <div className="flex lg:hidden">
          <UwifiBrandTile
            className="h-[3.15rem] w-[3.15rem]"
            imageClassName="w-[2.15rem]"
          />
        </div>

        <div className="flex items-center gap-3">
          <AnimatedThemeToggler variant="circle" />

          <button
            type="button"
            className="theme-control group flex min-w-0 items-center gap-3 rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-left shadow-[0_14px_34px_rgba(193,196,205,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7eea2f_0%,#07cf47_42%,#7b3cff_100%)] text-[1.3rem] font-medium tracking-[-0.05em] text-white shadow-[0_10px_24px_rgba(108,87,192,0.24)]">
              LN
            </div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-[0.95rem] font-medium tracking-[-0.035em] text-ink">
                Luc Nguyen
              </div>
              <div className="mt-0.5 truncate text-[0.82rem] text-ink-muted">
                luc.nguyen@uwifi.com
              </div>
            </div>

            <span
              aria-hidden="true"
              className="hidden h-7 w-px shrink-0 bg-line/70 sm:block"
            />

            <ChevronDown
              className="shrink-0 text-ink-muted transition-colors duration-200 group-hover:text-ink"
              size={18}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
