"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/cn";

type SectionTab = {
  label: string;
  href: string;
};

type SectionTabsProps = {
  items: SectionTab[];
};

export function SectionTabs({ items }: Readonly<SectionTabsProps>) {
  const pathname = usePathname();
  const activeHref =
    items
      .filter(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
      )
      .sort((left, right) => right.href.length - left.href.length)[0]?.href ?? "";

  return (
    <div className="theme-tab-shell inline-flex w-full max-w-full gap-2 overflow-x-auto rounded-[1.35rem] border p-1.5 backdrop-blur-xl sm:flex-wrap">
      {items.map((item) => {
        const active = item.href === activeHref;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "theme-tab-item inline-flex min-h-[2.85rem] shrink-0 items-center justify-center rounded-[1rem] border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
              active
                ? "theme-tab-item-active border"
                : "border-transparent",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
