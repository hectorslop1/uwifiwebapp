"use client";

import { motion } from "framer-motion";

type RippleSignalProps = {
  connected?: boolean;
};

const ripples = [
  { size: "14rem", duration: 3.8, delay: 0 },
  { size: "18rem", duration: 4.4, delay: 0.4 },
  { size: "22rem", duration: 5, delay: 0.8 },
];

export function RippleSignal({
  connected = true,
}: Readonly<RippleSignalProps>) {
  const color = connected
    ? "radial-gradient(circle, rgba(52,196,59,0.22) 0%, rgba(52,196,59,0.12) 30%, rgba(52,196,59,0.04) 52%, rgba(52,196,59,0) 76%)"
    : "radial-gradient(circle, rgba(232,76,61,0.22) 0%, rgba(232,76,61,0.12) 30%, rgba(232,76,61,0.04) 52%, rgba(232,76,61,0) 76%)";

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.size}
          className="absolute left-1/2 top-1/2 rounded-full blur-[8px]"
          style={{
            width: ripple.size,
            height: ripple.size,
            marginLeft: `calc(${ripple.size} / -2)`,
            marginTop: `calc(${ripple.size} / -2)`,
            backgroundImage: color,
          }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1.1, opacity: [0, 0.34, 0] }}
          transition={{
            duration: ripple.duration,
            delay: ripple.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
