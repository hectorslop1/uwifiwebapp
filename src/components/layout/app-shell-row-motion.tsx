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
        className="mx-auto max-w-[1560px] lg:flex lg:items-stretch"
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
          className="min-w-0 flex flex-1 flex-col"
        >
          {content}
        </motion.main>
      </motion.div>
    </LayoutGroup>
  );
}
