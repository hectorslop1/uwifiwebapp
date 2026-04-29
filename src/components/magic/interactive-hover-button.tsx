"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { PREMIUM_EASE } from "./motion-tokens";

type SharedProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

type InteractiveHoverButtonLinkProps = SharedProps & {
  href: string;
};

type InteractiveHoverButtonProps = SharedProps & {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

const hoverAnimation = {
  scale: 1.015,
  boxShadow:
    "0 18px 34px rgba(193,196,206,0.18), 0 6px 16px rgba(205,207,214,0.12)",
};

export function InteractiveHoverButtonLink({
  href,
  children,
  className,
  containerClassName,
}: Readonly<InteractiveHoverButtonLinkProps>) {
  return (
    <motion.div
      whileHover={hoverAnimation}
      transition={{ duration: 0.45, ease: PREMIUM_EASE }}
      className={containerClassName}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export function InteractiveHoverButton({
  children,
  className,
  containerClassName,
  type = "button",
  ...props
}: Readonly<InteractiveHoverButtonProps>) {
  return (
    <motion.button
      type={type}
      whileHover={hoverAnimation}
      transition={{ duration: 0.45, ease: PREMIUM_EASE }}
      className={`${containerClassName ?? ""} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </motion.button>
  );
}
