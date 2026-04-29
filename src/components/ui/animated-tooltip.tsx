"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerOffset = event.clientX - rect.left - rect.width / 2;

    animationFrameRef.current = requestAnimationFrame(() => {
      x.set(pointerOffset);
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
              "pointer-events-none absolute -top-13 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs text-white shadow-xl",
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
