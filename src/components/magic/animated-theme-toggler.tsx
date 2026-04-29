"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { PREMIUM_EASE } from "./motion-tokens";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function AnimatedThemeToggler() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("uwifi-theme");
    const nextTheme = stored === "dark" ? "dark" : "light";
    applyTheme(nextTheme);

    const frame = window.requestAnimationFrame(() => {
      setTheme(nextTheme);
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("uwifi-theme", nextTheme);
  };

  return (
    <motion.button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.45, ease: PREMIUM_EASE }}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-ink-soft shadow-[0_14px_34px_rgba(193,196,205,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? theme : "idle"}
          initial={{ opacity: 0, y: 8, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.88 }}
          transition={{ duration: 0.55, ease: PREMIUM_EASE }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Moon size={17} strokeWidth={1.8} />
          ) : (
            <Sun size={17} strokeWidth={1.8} />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
