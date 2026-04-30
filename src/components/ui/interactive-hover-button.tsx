"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { PREMIUM_EASE } from "@/src/components/magic/motion-tokens";

type InteractiveHoverButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function InteractiveHoverButton({
  children,
  className,
  disabled,
  ...props
}: Readonly<InteractiveHoverButtonProps>) {
  return (
    <motion.div
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.015,
              boxShadow:
                "0 18px 34px rgba(76,175,80,0.14), 0 8px 22px rgba(126,87,194,0.16)",
            }
      }
      transition={{ duration: 0.42, ease: PREMIUM_EASE }}
    >
      <button
        className={cx(
          "group relative flex w-full items-center justify-center overflow-hidden rounded-full px-4 py-3.5 text-[0.96rem] font-medium text-white shadow-[0_18px_36px_rgba(16,18,22,0.12)] transition-[box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-70",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className="absolute inset-0 rounded-full bg-[#111215]" />
        <span className="absolute inset-0 translate-y-full rounded-full bg-[linear-gradient(135deg,#342f63_0%,#6f5ab1_52%,#5aa55e_100%)] transition-transform duration-500 ease-out group-hover:translate-y-0" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_44%)] opacity-70" />
        <span className="relative flex items-center gap-2">
          <span className="transition-transform duration-300 group-hover:-translate-x-0.5">{children}</span>
          <ArrowRight
            size={16}
            strokeWidth={1.9}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </button>
    </motion.div>
  );
}
