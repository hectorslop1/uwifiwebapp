"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";

type AppShellRowMotionProps = {
  sidebar: ReactNode;
  content: ReactNode;
};

const layoutSpring = {
  type: "spring",
  stiffness: 460,
  damping: 50,
  mass: 1.05,
} as const;

export function AppShellRowMotion({
  sidebar,
  content,
}: Readonly<AppShellRowMotionProps>) {
  return (
    <LayoutGroup id="app-shell-row">
      <motion.div
        layout
        transition={{ layout: layoutSpring }}
        style={{ willChange: "transform" }}
        className="mx-auto max-w-[1560px] lg:flex lg:min-h-[calc(100dvh-5.4rem)] lg:items-stretch"
      >
        <motion.div
          layout="position"
          transition={{ layout: layoutSpring }}
          style={{ willChange: "transform" }}
          className="transform-gpu"
        >
          {sidebar}
        </motion.div>

        <motion.main
          layout
          transition={{ layout: layoutSpring }}
          style={{ willChange: "transform" }}
          className="min-w-0 flex-1 lg:min-h-0"
        >
          {content}
        </motion.main>
      </motion.div>
    </LayoutGroup>
  );
}
