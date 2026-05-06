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
        glow: "rgba(55,200,90,0.26)",
        mist: "rgba(55,200,90,0.12)",
      }
    : {
        core: "bg-[#e65b4a]",
        glow: "rgba(230,91,74,0.24)",
        mist: "rgba(230,91,74,0.11)",
      };

  return (
    <span className={`relative inline-flex h-4 w-4 items-center justify-center lg:h-[1.1rem] lg:w-[1.1rem] ${className ?? ""}`.trim()}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: tones.glow }}
        animate={{ scale: [1, 1.95, 1], opacity: [0.18, 0.48, 0.18] }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: PREMIUM_EASE,
        }}
      />
      <motion.span
        className="absolute inset-[2px] rounded-full"
        style={{ backgroundColor: tones.mist }}
        animate={{ scale: [1, 1.28, 1], opacity: [0.3, 0.78, 0.3] }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: PREMIUM_EASE,
        }}
      />
      <span className={`relative z-10 h-2.5 w-2.5 rounded-full ${tones.core} lg:h-3 lg:w-3`} />
    </span>
  );
}
