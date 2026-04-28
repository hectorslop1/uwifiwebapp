"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function RouterStage() {
  return (
    <div className="relative flex min-h-[15rem] w-full items-end justify-center overflow-hidden lg:min-h-[22rem] lg:justify-end">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[18%] top-[10%] h-24 w-24 rounded-full bg-white/90 blur-3xl sm:h-32 sm:w-32 lg:h-40 lg:w-40" />

        <div className="absolute right-[10%] top-[16%] h-[42%] w-[34%] rounded-[2.5rem] bg-[radial-gradient(circle_at_24%_42%,rgba(148,152,161,0.18),rgba(255,255,255,0)_68%)] blur-[24px] lg:h-[46%] lg:w-[38%]" />

        <div className="absolute bottom-[1rem] right-[10%] h-[3.5rem] w-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(108,114,124,0.12)_0%,rgba(123,128,139,0.07)_30%,rgba(255,255,255,0)_74%)] blur-[18px] sm:bottom-[1.1rem] sm:h-[3.9rem] lg:bottom-[1.35rem] lg:h-[4.5rem] lg:w-[64%]" />

        <div className="absolute bottom-[0.82rem] right-[22%] h-4 w-[22%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(54,58,67,0.24)_0%,rgba(74,79,88,0.12)_44%,rgba(255,255,255,0)_100%)] blur-[8px] sm:h-5 lg:bottom-[0.96rem] lg:h-6 lg:w-[24%]" />

        <div className="absolute bottom-[0.78rem] right-[12%] h-[2.7rem] w-[56%] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.58)_0%,rgba(247,248,250,0.24)_44%,rgba(255,255,255,0)_100%)] blur-[9px] sm:h-[3rem] lg:bottom-[0.94rem] lg:h-[3.3rem] lg:w-[60%]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mr-0 mb-[0.65rem] sm:mb-[0.74rem] lg:mr-6 lg:mb-[0.82rem]"
      >
        <Image
          src="/images/router.png"
          alt="Gateway device"
          width={460}
          height={700}
          priority
          sizes="(max-width: 1024px) 220px, 320px"
          className="h-auto w-[11.5rem] object-contain drop-shadow-[0_18px_28px_rgba(87,92,102,0.1)] sm:w-[13.5rem] lg:w-[15.5rem] xl:w-[17rem]"
        />
      </motion.div>
    </div>
  );
}

export default RouterStage;
