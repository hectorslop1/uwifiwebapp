"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { PREMIUM_EASE } from "@/src/components/magic/motion-tokens";
import { RippleSignal } from "@/src/components/magic/ripple-signal";

export function RouterStage() {
  return (
    <div className="relative flex min-h-[15rem] w-full items-end justify-center overflow-hidden lg:min-h-[22rem] lg:justify-end">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[18%] top-[10%] h-24 w-24 rounded-full bg-white/90 blur-3xl sm:h-32 sm:w-32 lg:h-40 lg:w-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: PREMIUM_EASE }}
        className="relative z-10 mr-0 mb-[0.65rem] sm:mb-[0.74rem] lg:mr-6 lg:mb-[0.82rem]"
      >
        <div className="relative flex h-[16rem] w-[11.5rem] items-end justify-center sm:h-[18rem] sm:w-[13.5rem] lg:h-[21rem] lg:w-[15.5rem] xl:h-[23rem] xl:w-[17rem]">
          <RippleSignal connected />

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
