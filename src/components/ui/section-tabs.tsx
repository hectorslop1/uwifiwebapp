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

  return (
    <div className="theme-tab-shell inline-flex flex-wrap gap-2 rounded-pill border p-1.5 backdrop-blur-xl">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "theme-tab-item rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5",
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
