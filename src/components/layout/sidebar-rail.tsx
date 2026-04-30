"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FileText, 
  House,
  LogOut,
  Menu,
  Router,
  Settings,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/overview", icon: House },
  { label: "Gateway", href: "/gateway", icon: Router },
  { label: "U-Wallet", href: "/wallet", icon: Wallet },
  { label: "Billing", href: "/billing", icon: FileText },
  { label: "U-Store", href: "/store", icon: ShoppingBag },
  { label: "Settings", href: "/settings", icon: Settings },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  expanded,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof House;
  active: boolean;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "group relative flex items-center overflow-hidden rounded-[1.35rem] border transition-all duration-200 hover:-translate-y-0.5",
        expanded
          ? "gap-3.5 px-4 py-4"
          : "justify-center px-2 py-3.5",
        active
          ? "theme-control-active border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] text-ink shadow-[0_22px_46px_rgba(184,191,179,0.2),0_8px_18px_rgba(208,214,205,0.16),inset_0_1px_0_rgba(255,255,255,0.96)]"
          : "theme-sidebar-item-idle border-transparent text-ink-soft hover:border-[#d6edd9] hover:bg-[linear-gradient(180deg,rgba(249,253,249,0.94),rgba(237,246,239,0.82))] hover:text-ink hover:shadow-[0_18px_30px_rgba(183,206,185,0.18),inset_0_1px_0_rgba(255,255,255,0.94)]"
      )}
    >
      <span
        className={cx(
          "flex shrink-0 items-center justify-center rounded-[0.9rem] border transition-colors duration-200",
          expanded ? "h-9 w-9" : "h-10 w-10",
          active
            ? "border-[#dff3e3] bg-[linear-gradient(180deg,rgba(241,251,243,0.96),rgba(231,248,235,0.92))] text-[#34c43b] shadow-[0_8px_20px_rgba(140,199,142,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
            : "theme-sidebar-icon-idle border-white/0 bg-white/0 text-ink-muted group-hover:border-[#dff1e2] group-hover:bg-[linear-gradient(180deg,rgba(245,252,246,0.98),rgba(235,247,237,0.94))] group-hover:text-success group-hover:shadow-[0_10px_18px_rgba(168,201,171,0.14)]"
        )}
      >
        <Icon size={19} strokeWidth={1.8} />
      </span>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="min-w-0 whitespace-nowrap text-[0.95rem] font-medium tracking-[-0.03em]"
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}

function SidebarContent({
  expanded,
  pathname,
  onNavigate,
  onLogout,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  const currentPath = useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname]);

  return (
    <>
      <nav className="flex flex-1 flex-col gap-2.5 pt-4">
        {navigation.map((item) => {
          const itemPath = item.href.replace(/\/$/, "") || "/";
          const active =
            currentPath === itemPath ||
            (itemPath !== "/" && currentPath.startsWith(`${itemPath}/`));

          return (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="border-t border-line/35 pt-5">
        <button
          type="button"
          onClick={onLogout}
          className={cx(
            "theme-sidebar-item-idle group flex w-full items-center rounded-[1.3rem] text-left font-medium tracking-[-0.03em] text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(249,253,249,0.94),rgba(237,246,239,0.82))] hover:text-ink hover:shadow-[0_18px_30px_rgba(183,206,185,0.18),inset_0_1px_0_rgba(255,255,255,0.94)]",
            expanded ? "gap-3.5 px-4 py-3.5 text-[0.95rem]" : "justify-center px-2 py-3.5 text-[0.95rem]"
          )}
        >
          <span className="theme-sidebar-icon-idle flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-all duration-200 group-hover:bg-[linear-gradient(180deg,rgba(245,252,246,0.98),rgba(235,247,237,0.94))] group-hover:text-success group-hover:shadow-[0_10px_18px_rgba(168,201,171,0.14)]">
            <LogOut size={19} strokeWidth={1.8} />
          </span>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="whitespace-nowrap"
              >
                Log out
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}

export function SidebarRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div className="flex items-center justify-end border-b border-line/20 px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="theme-control-button flex h-11 w-11 items-center justify-center rounded-full border text-ink shadow-[0_12px_26px_rgba(201,203,212,0.1),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="relative hidden w-[92px] shrink-0 lg:block">
        <motion.aside
          onMouseEnter={() => setDesktopOpen(true)}
          onMouseLeave={() => setDesktopOpen(false)}
          animate={{ width: desktopOpen ? 232 : 92 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ willChange: "width" }}
          className="theme-sidebar-rail absolute inset-y-0 left-0 z-20 flex min-h-[calc(100dvh-5.4rem)] flex-col border-r border-line/25 bg-white/12 px-3 py-4 backdrop-blur-xl"
        >
          <SidebarContent
            expanded={desktopOpen}
            pathname={pathname}
            onLogout={handleLogout}
          />
        </motion.aside>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="theme-overlay fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="theme-panel fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,247,250,0.9))] px-4 py-5 shadow-[0_28px_72px_rgba(169,173,185,0.22)] backdrop-blur-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[1rem] font-medium tracking-[-0.04em] text-ink">
                  Menu
                </div>

                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMobileOpen(false)}
                  className="theme-control-button flex h-10 w-10 items-center justify-center rounded-full border text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              <SidebarContent
                expanded
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
