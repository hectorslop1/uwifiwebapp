"use client";

import { motion } from "framer-motion";

import { PREMIUM_EASE } from "./motion-tokens";

type StatusBeaconProps = {
  active?: boolean;
  className?: string;
};

export function StatusBeacon({
  active = true,
  className,
}: Readonly<StatusBeaconProps>) {
  const tones = active
    ? {
        core: "bg-[#37c85a]",
        glow: "rgba(55,200,90,0.28)",
        ring: "rgba(55,200,90,0.18)",
      }
    : {
        core: "bg-[#e65b4a]",
        glow: "rgba(230,91,74,0.26)",
        ring: "rgba(230,91,74,0.16)",
      };

  return (
    <span className={`relative inline-flex h-4 w-4 items-center justify-center lg:h-[1.1rem] lg:w-[1.1rem] ${className ?? ""}`.trim()}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: tones.glow }}
        animate={{ scale: [1, 1.9, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: PREMIUM_EASE,
        }}
      />
      <motion.span
        className="absolute inset-[1px] rounded-full"
        style={{ boxShadow: `0 0 0 1px ${tones.ring}` }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: PREMIUM_EASE,
        }}
      />
      <span className={`relative z-10 h-2.5 w-2.5 rounded-full ${tones.core} shadow-[0_0_0_1px_rgba(255,255,255,0.82)] lg:h-3 lg:w-3`} />
    </span>
  );
}
