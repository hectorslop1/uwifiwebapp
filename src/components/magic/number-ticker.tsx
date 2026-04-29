"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

import { PREMIUM_EASE } from "./motion-tokens";

type NumberTickerProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

function formatNumber(value: number, decimals: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: Readonly<NumberTickerProps>) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(
    `${prefix}${formatNumber(0, decimals)}${suffix}`,
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: PREMIUM_EASE,
      onUpdate: (latest) => {
        setDisplayValue(
          `${prefix}${formatNumber(latest, decimals)}${suffix}`,
        );
      },
    });

    return () => controls.stop();
  }, [decimals, motionValue, prefix, suffix, value]);

  return <span className={className}>{displayValue}</span>;
}
