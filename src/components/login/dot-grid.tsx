"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import styles from "./dot-grid.module.css";

type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  className?: string;
  style?: CSSProperties;
};

type Dot = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default function DotGrid({
  dotSize = 8,
  gap = 18,
  baseColor = "#8d74ff",
  activeColor = "#ffffff",
  proximity = 130,
  shockRadius = 180,
  shockStrength = 6,
  resistance = 0.86,
  className,
  style,
}: Readonly<DotGridProps>) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas || typeof window === "undefined") {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dots: Dot[] = [];
    const pointer = {
      x: -1000,
      y: -1000,
      speed: 0,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
      active: false,
    };

    const base = hexToRgb(baseColor);
    const active = hexToRgb(activeColor);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;

    const buildGrid = () => {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots.length = 0;

      const cell = dotSize + gap;
      const columns = Math.floor((width + gap) / cell);
      const rows = Math.floor((height + gap) / cell);
      const gridWidth = columns * cell - gap;
      const gridHeight = rows * cell - gap;
      const startX = (width - gridWidth) / 2 + dotSize / 2;
      const startY = (height - gridHeight) / 2 + dotSize / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          dots.push({
            x: startX + column * cell,
            y: startY + row * cell,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
          });
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const distanceX = dot.x - pointer.x;
        const distanceY = dot.y - pointer.y;
        const distance = Math.hypot(distanceX, distanceY);

        if (pointer.active && distance < proximity) {
          const influence = 1 - distance / proximity;
          const safeDistance = Math.max(distance, 1);
          const impulse = 0.15 + pointer.speed * 0.00075;
          dot.velocityX += (distanceX / safeDistance) * influence * impulse;
          dot.velocityY += (distanceY / safeDistance) * influence * impulse;
        }

        dot.velocityX += -dot.offsetX * 0.04;
        dot.velocityY += -dot.offsetY * 0.04;
        dot.velocityX *= resistance;
        dot.velocityY *= resistance;
        dot.offsetX += dot.velocityX;
        dot.offsetY += dot.velocityY;

        const glow = pointer.active && distance < proximity ? 1 - distance / proximity : 0;
        const red = Math.round(base.r + (active.r - base.r) * glow);
        const green = Math.round(base.g + (active.g - base.g) * glow);
        const blue = Math.round(base.b + (active.b - base.b) * glow);

        context.beginPath();
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.18 + glow * 0.82})`;
        context.arc(dot.x + dot.offsetX, dot.y + dot.offsetY, dotSize / 2, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const insideBounds =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!insideBounds) {
        pointer.active = false;
        pointer.speed = 0;
        return;
      }

      const now = performance.now();
      const deltaTime = pointer.lastTime ? now - pointer.lastTime : 16;
      const deltaX = event.clientX - pointer.lastX;
      const deltaY = event.clientY - pointer.lastY;

      pointer.speed = Math.min(Math.hypot(deltaX, deltaY) * (1000 / deltaTime), 3200);
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastTime = now;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
      pointer.speed = 0;
    };

    const onClick = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const insideBounds =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!insideBounds) {
        return;
      }

      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for (const dot of dots) {
        const deltaX = dot.x - clickX;
        const deltaY = dot.y - clickY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > shockRadius) {
          continue;
        }

        const falloff = 1 - distance / shockRadius;
        const safeDistance = Math.max(distance, 1);
        dot.velocityX += (deltaX / safeDistance) * shockStrength * falloff;
        dot.velocityY += (deltaY / safeDistance) * shockStrength * falloff;
      }
    };

    const resizeObserver = new ResizeObserver(buildGrid);
    resizeObserver.observe(wrapper);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("click", onClick);

    buildGrid();
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClick);
    };
  }, [activeColor, baseColor, dotSize, gap, proximity, resistance, shockRadius, shockStrength]);

  return (
    <div ref={wrapperRef} className={cx(styles.root, className)} style={style}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
