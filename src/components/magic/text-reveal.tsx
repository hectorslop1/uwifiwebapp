"use client";

import { motion } from "framer-motion";

import { PREMIUM_EASE } from "./motion-tokens";

type TextRevealProps = {
  text: string;
  className?: string;
};

export function TextReveal({
  text,
  className,
}: Readonly<TextRevealProps>) {
  return (
    <span className={`inline-flex overflow-hidden ${className ?? ""}`}>
      <motion.span
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.7, ease: PREMIUM_EASE }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </span>
  );
}
