"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { PREMIUM_EASE } from "./motion-tokens";

type ThemeMode = "light" | "dark";

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star";

interface AnimatedThemeTogglerProps extends HTMLMotionProps<"button"> {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
}

type ViewTransitionLike = {
  ready: Promise<void>;
  finished?: Promise<void>;
};

type DocumentWithTransition = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransitionLike;
};

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

function getTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem("uwifi-theme");

  if (storedTheme === "dark") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function buildClipPath(
  variant: TransitionVariant,
  radius: number,
  x: number,
  y: number,
) {
  if (variant === "circle") {
    return `circle(${radius}px at ${x}px ${y}px)`;
  }

  if (variant === "square") {
    return `inset(${Math.max(0, y - radius)}px ${Math.max(0, window.innerWidth - x - radius)}px ${Math.max(0, window.innerHeight - y - radius)}px ${Math.max(0, x - radius)}px round 0px)`;
  }

  const sides =
    variant === "triangle"
      ? 3
      : variant === "diamond"
      ? 4
      : variant === "hexagon"
      ? 6
      : variant === "star"
      ? 10
      : 4;

  const points = Array.from({ length: sides }, (_, index) => {
    const angleOffset =
      variant === "triangle"
        ? -Math.PI / 2
        : variant === "diamond"
        ? -Math.PI / 4
        : -Math.PI / 2;
    const angle = (Math.PI * 2 * index) / sides + angleOffset;
    const pointRadius =
      variant === "star" && index % 2 === 1 ? radius * 0.45 : radius;

    return `${x + Math.cos(angle) * pointRadius}px ${y + Math.sin(angle) * pointRadius}px`;
  });

  if (variant === "rectangle") {
    return `polygon(${x - radius}px ${y - radius * 0.68}px, ${x + radius}px ${y - radius * 0.68}px, ${x + radius}px ${y + radius * 0.68}px, ${x - radius}px ${y + radius * 0.68}px)`;
  }

  return `polygon(${points.join(", ")})`;
}

export function AnimatedThemeToggler({
  className,
  duration = 400,
  variant,
  fromCenter = false,
  onClick,
  ...props
}: Readonly<AnimatedThemeTogglerProps>) {
  const shape = variant ?? "circle";
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const nextTheme = getTheme();
    applyTheme(nextTheme);

    const frame = window.requestAnimationFrame(() => {
      setTheme(nextTheme);
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionApi = document as DocumentWithTransition;
    const buttonBounds = buttonRef.current?.getBoundingClientRect();

    const x = fromCenter
      ? window.innerWidth / 2
      : (buttonBounds?.left ?? window.innerWidth / 2) +
        (buttonBounds?.width ?? 0) / 2;
    const y = fromCenter
      ? window.innerHeight / 2
      : (buttonBounds?.top ?? window.innerHeight / 2) +
        (buttonBounds?.height ?? 0) / 2;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const startRadius = fromCenter
      ? 0
      : Math.max(buttonBounds?.width ?? 0, buttonBounds?.height ?? 0) / 2;

    const commitTheme = () => {
      flushSync(() => setTheme(nextTheme));
      applyTheme(nextTheme);
      window.localStorage.setItem("uwifi-theme", nextTheme);
    };

    document.documentElement.style.setProperty(
      "--theme-transition-duration",
      `${duration}ms`,
    );

    if (
      !transitionApi.startViewTransition ||
      prefersReducedMotion ||
      !buttonRef.current
    ) {
      commitTheme();
      return;
    }

    const transition = transitionApi.startViewTransition(() => {
      commitTheme();
    });

    await transition.ready;

    const animation = document.documentElement.animate(
      {
        clipPath: [
          buildClipPath(shape, startRadius, x, y),
          buildClipPath(shape, maxRadius, x, y),
        ],
      },
      {
        duration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      } as KeyframeAnimationOptions,
    );

    await Promise.allSettled([
      animation.finished,
      transition.finished ?? Promise.resolve(),
    ]);

    document.documentElement.style.removeProperty("--theme-transition-duration");
  }, [duration, fromCenter, shape, theme]);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label="Toggle theme"
      onClick={async (event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          await toggleTheme();
        }
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.45, ease: PREMIUM_EASE }}
      className={cn(
        "theme-control relative flex h-11 w-11 items-center justify-center rounded-full border text-ink-soft backdrop-blur-xl",
        className,
      )}
      {...props}
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
