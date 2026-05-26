"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  House,
  LifeBuoy,
  LogOut,
  Router,
  Settings,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";

import { useMobileNav } from "./mobile-nav-context";

const PREMIUM_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const navigation = [
  { label: "Dashboard", href: "/overview", icon: House },
  { label: "Gateway", href: "/gateway", icon: Router },
  { label: "U-Wallet", href: "/wallet", icon: Wallet },
  { label: "Billing", href: "/billing", icon: FileText },
  { label: "U-Store", href: "/store", icon: ShoppingBag },
  { label: "Support", href: "/support", icon: LifeBuoy },
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
  collapsible = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof House;
  active: boolean;
  expanded: boolean;
  collapsible?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-label={!expanded ? label : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "group relative flex items-center overflow-hidden rounded-[1.35rem] border transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        expanded
          ? "gap-3.5 px-4 py-4"
          : collapsible
          ? "justify-center px-2 py-3.5 group-hover/sidebar:justify-start group-hover/sidebar:gap-3.5 group-hover/sidebar:px-4 group-hover/sidebar:py-4 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3.5 group-focus-within/sidebar:px-4 group-focus-within/sidebar:py-4"
          : "justify-center px-2 py-3.5",
        active
          ? "theme-control-active border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] text-ink shadow-[0_22px_46px_rgba(184,191,179,0.2),0_8px_18px_rgba(208,214,205,0.16),inset_0_1px_0_rgba(255,255,255,0.96)]"
          : "theme-sidebar-item-idle border-transparent text-ink-soft hover:border-[#d6edd9] hover:bg-[linear-gradient(180deg,rgba(249,253,249,0.94),rgba(237,246,239,0.82))] hover:text-ink hover:shadow-[0_18px_30px_rgba(183,206,185,0.18),inset_0_1px_0_rgba(255,255,255,0.94)]"
      )}
    >
      <span
        className={cx(
          "flex shrink-0 items-center justify-center rounded-[0.9rem] border transition-[background-color,border-color,color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
          expanded
            ? "h-9 w-9"
            : collapsible
            ? "h-10 w-10 group-hover/sidebar:h-9 group-hover/sidebar:w-9 group-focus-within/sidebar:h-9 group-focus-within/sidebar:w-9"
            : "h-10 w-10",
          active
            ? "border-[#dff3e3] bg-[linear-gradient(180deg,rgba(241,251,243,0.96),rgba(231,248,235,0.92))] text-[#34c43b] shadow-[0_8px_20px_rgba(140,199,142,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
            : "theme-sidebar-icon-idle border-white/0 bg-white/0 text-ink-muted group-hover:border-[#dff1e2] group-hover:bg-[linear-gradient(180deg,rgba(245,252,246,0.98),rgba(235,247,237,0.94))] group-hover:text-success group-hover:shadow-[0_10px_18px_rgba(168,201,171,0.14)]"
        )}
      >
        <Icon size={19} strokeWidth={1.8} />
      </span>

      <span
        className={cx(
          "min-w-0 overflow-hidden whitespace-nowrap text-[0.95rem] font-medium tracking-[-0.03em] transition-[max-width,opacity,transform] duration-200 motion-reduce:transition-none",
          expanded
            ? "max-w-[10rem] translate-x-0 opacity-100"
            : collapsible
            ? "max-w-0 -translate-x-1 opacity-0 group-hover/sidebar:max-w-[10rem] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-[10rem] group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100"
            : "max-w-0 -translate-x-1 opacity-0",
        )}
        style={{ transitionTimingFunction: PREMIUM_EASE }}
      >
        {label}
      </span>

      {!expanded ? (
        <span
          className={cx(
            "theme-sidebar-tooltip pointer-events-none absolute left-[calc(100%+0.85rem)] top-1/2 z-30 -translate-x-1 -translate-y-1/2 rounded-[0.95rem] border px-3 py-2 text-[0.82rem] font-medium tracking-[-0.02em] whitespace-nowrap opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none",
            collapsible &&
              "group-hover/sidebar:opacity-0 group-focus-within/sidebar:opacity-0",
          )}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  expanded,
  pathname,
  onNavigate,
  onLogout,
  isLoggingOut = false,
  collapsible = false,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  collapsible?: boolean;
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
              collapsible={collapsible}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="border-t border-line/35 pt-5">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-label={!expanded ? "Log out" : undefined}
          className={cx(
            "theme-sidebar-item-idle group relative flex w-full items-center rounded-[1.3rem] text-left font-medium tracking-[-0.03em] text-ink-soft transition-[background-color,box-shadow,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(249,253,249,0.94),rgba(237,246,239,0.82))] hover:text-ink hover:shadow-[0_18px_30px_rgba(183,206,185,0.18),inset_0_1px_0_rgba(255,255,255,0.94)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            expanded
              ? "gap-3.5 px-4 py-3.5 text-[0.95rem]"
              : collapsible
              ? "justify-center px-2 py-3.5 text-[0.95rem] group-hover/sidebar:justify-start group-hover/sidebar:gap-3.5 group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3.5 group-focus-within/sidebar:px-4 group-focus-within/sidebar:py-3.5"
              : "justify-center px-2 py-3.5 text-[0.95rem]"
          )}
        >
          <span className="theme-sidebar-icon-idle flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-[background-color,box-shadow,color] duration-200 ease-out group-hover:bg-[linear-gradient(180deg,rgba(245,252,246,0.98),rgba(235,247,237,0.94))] group-hover:text-success group-hover:shadow-[0_10px_18px_rgba(168,201,171,0.14)] motion-reduce:transition-none">
            <LogOut size={19} strokeWidth={1.8} />
          </span>

          <span
            className={cx(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 motion-reduce:transition-none",
              expanded
                ? "max-w-[10rem] translate-x-0 opacity-100"
                : collapsible
                ? "max-w-0 -translate-x-1 opacity-0 group-hover/sidebar:max-w-[10rem] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-[10rem] group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100"
                : "max-w-0 -translate-x-1 opacity-0",
            )}
            style={{ transitionTimingFunction: PREMIUM_EASE }}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </span>

          {!expanded ? (
            <span
              className={cx(
                "theme-sidebar-tooltip pointer-events-none absolute left-[calc(100%+0.85rem)] top-1/2 z-30 -translate-x-1 -translate-y-1/2 rounded-[0.95rem] border px-3 py-2 text-[0.82rem] font-medium tracking-[-0.02em] whitespace-nowrap opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none",
                collapsible &&
                  "group-hover/sidebar:opacity-0 group-focus-within/sidebar:opacity-0",
              )}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </span>
          ) : null}
        </button>
      </div>
    </>
  );
}

export function SidebarRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileNavOpen, setMobileNavOpen, closeMobileNav } = useMobileNav();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const portalTarget = typeof document === "undefined" ? null : document.body;

  const performLogout = async () => {
    setMobileNavOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const handleLogout = () => {
    startLogoutTransition(() => {
      void performLogout();
    });
  };

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileNav, mobileNavOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <>
      <div
        className="group/sidebar relative hidden w-[92px] shrink-0 overflow-visible transition-[width] duration-[360ms] hover:w-[232px] focus-within:w-[232px] motion-reduce:transition-none lg:sticky lg:top-[5rem] lg:block lg:h-[calc(100dvh-5rem)]"
        style={{ transitionTimingFunction: PREMIUM_EASE }}
      >
        <aside
          className={cx(
            "theme-sidebar-rail relative z-20 flex h-full w-full min-h-0 flex-col overflow-hidden border-r border-line/25 bg-white/12 px-3 py-4 shadow-[0_24px_52px_rgba(177,184,196,0.08)] backdrop-blur-xl transition-[box-shadow] duration-300 motion-reduce:transition-none",
          )}
          style={{ transitionTimingFunction: PREMIUM_EASE }}
        >
          <SidebarContent
            expanded={false}
            collapsible
            pathname={pathname}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </aside>
      </div>

      {portalTarget
        ? createPortal(
            <AnimatePresence>
              {mobileNavOpen ? (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close navigation overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    onClick={() => setMobileNavOpen(false)}
                    className="theme-overlay fixed inset-0 z-40 bg-[rgba(11,14,18,0.18)] backdrop-blur-sm lg:hidden"
                  />

                  <motion.aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 42,
                      mass: 0.85,
                    }}
                    className="theme-panel fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,247,250,0.9))] px-4 py-5 shadow-[0_28px_72px_rgba(169,173,185,0.22)] backdrop-blur-2xl lg:hidden"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[1rem] font-medium tracking-[-0.04em] text-ink">
                        Menu
                      </div>

                      <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setMobileNavOpen(false)}
                        className="theme-control-button flex h-10 w-10 items-center justify-center rounded-full border text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                      >
                        <X size={18} strokeWidth={1.8} />
                      </button>
                    </div>

                    <SidebarContent
                      expanded
                      pathname={pathname}
                      onNavigate={() => setMobileNavOpen(false)}
                      onLogout={handleLogout}
                      isLoggingOut={isLoggingOut}
                    />
                  </motion.aside>
                </>
              ) : null}
            </AnimatePresence>,
            portalTarget,
          )
        : null}
    </>
  );
}
