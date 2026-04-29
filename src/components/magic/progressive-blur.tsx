"use client";

import { motion } from "framer-motion";
import {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

import { PREMIUM_EASE } from "./motion-tokens";

type ProgressiveBlurProps = PropsWithChildren<{
  maxHeightClassName?: string;
  className?: string;
}>;

export function ProgressiveBlur({
  children,
  maxHeightClassName = "max-h-[30rem]",
  className,
}: Readonly<ProgressiveBlurProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateEdges = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowTop(scrollTop > 4);
      setShowBottom(scrollTop + clientHeight < scrollHeight - 4);
    };

    updateEdges();
    container.addEventListener("scroll", updateEdges);
    window.addEventListener("resize", updateEdges);

    return () => {
      container.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`.trim()}>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: showTop ? 1 : 0 }}
        transition={{ duration: 0.4, ease: PREMIUM_EASE }}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 backdrop-blur-[2px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(var(--color-surface-raised), 0.92), rgba(var(--color-surface-raised), 0))",
        }}
      />

      <div
        ref={containerRef}
        className={`overflow-auto ${maxHeightClassName}`.trim()}
      >
        {children}
      </div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: showBottom ? 1 : 0 }}
        transition={{ duration: 0.4, ease: PREMIUM_EASE }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 backdrop-blur-[2px]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(var(--color-surface-raised), 0.94), rgba(var(--color-surface-raised), 0))",
        }}
      />
    </div>
  );
}
