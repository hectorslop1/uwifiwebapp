"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedTooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AnimatedTooltip({
  content,
  children,
  className,
  contentClassName,
}: Readonly<AnimatedTooltipProps>) {
  const [open, setOpen] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-100, 100], [-5, 5]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-14, 14]), springConfig);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = event.currentTarget.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      x.set(event.clientX - rect.left - halfWidth);
    });
  };

  return (
    <div
      className={cn("group relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 18,
              },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{
              translateX,
              rotate,
              whiteSpace: "nowrap",
            }}
            className={cn(
              "pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 flex -translate-x-1/2 flex-col items-center justify-center rounded-[1rem] border border-white/12 bg-[#101216]/96 px-4 py-2 text-xs text-white shadow-[0_18px_40px_rgba(7,10,18,0.22)] backdrop-blur-xl",
              contentClassName,
            )}
          >
            <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />
            <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
            <div className="relative z-30">{content}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {children}
    </div>
  );
}
