"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { PREMIUM_EASE } from "@/src/components/magic/motion-tokens";
import { RippleSignal } from "@/src/components/magic/ripple-signal";

export function RouterStage({
  connected = true,
}: Readonly<{
  connected?: boolean;
}>) {
  return (
    <div className="relative flex min-h-[15rem] w-full items-end justify-center overflow-visible lg:min-h-[22rem] lg:justify-end">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            scale: connected ? [1, 1.08, 1] : [1, 1.04, 1],
            opacity: connected ? [0.48, 0.72, 0.48] : [0.4, 0.58, 0.4],
          }}
          transition={{
            duration: connected ? 2.8 : 4.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: PREMIUM_EASE,
          }}
          className={`absolute right-[18%] top-[10%] h-24 w-24 rounded-full blur-3xl sm:h-32 sm:w-32 lg:h-40 lg:w-40 ${
            connected ? "bg-[rgba(52,196,59,0.26)]" : "bg-[rgba(232,76,61,0.26)]"
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: PREMIUM_EASE }}
        className="relative z-10 mr-0 mb-[0.35rem] translate-y-[0.45rem] sm:mb-[0.52rem] sm:translate-y-[0.62rem] lg:mr-6 lg:mb-[0.6rem] lg:translate-y-[1.05rem]"
      >
        <div className="relative flex h-[16rem] w-[11.5rem] items-end justify-center overflow-visible sm:h-[18rem] sm:w-[13.5rem] lg:h-[21rem] lg:w-[15.5rem] xl:h-[23rem] xl:w-[17rem]">
          <RippleSignal connected={connected} />

          <Image
            src="/images/router.png"
            alt="Gateway device"
            width={460}
            height={700}
            priority
            sizes="(max-width: 1024px) 220px, 320px"
            className="relative z-10 h-auto w-[11.5rem] object-contain sm:w-[13.5rem] lg:w-[15.5rem] xl:w-[17rem]"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default RouterStage;
