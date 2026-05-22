"use client";

import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

type RippleSignalProps = ComponentPropsWithoutRef<"div"> & {
  connected?: boolean;
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
};

export const RippleSignal = React.memo(function RippleSignal({
  connected = true,
  mainCircleSize = 210,
  mainCircleOpacity = 0.30,
  numCircles = 8,
  className,
  ...props
}: Readonly<RippleSignalProps>) {
  const tone = connected ? "2,189,48" : "232,76,61";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-visible",
        className,
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, index) => {
        const size = mainCircleSize + index * 70;
        const opacity = Math.max(mainCircleOpacity - index * 0.024, 0.05);
        const animationDelay = `${index * 0.06}s`;

        return (
          <div
            key={index}
            className="animate-ripple absolute rounded-full border"
            style={
              {
                "--i": index,
                "--duration": connected ? "5.8s" : "6.4s",
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: `rgba(${tone}, 1)`,
                backgroundColor: `rgba(${tone}, 0.25)`,
                boxShadow: `0 0 24px rgba(${tone}, 0.03)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

RippleSignal.displayName = "RippleSignal";
