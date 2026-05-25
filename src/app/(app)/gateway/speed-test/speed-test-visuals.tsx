"use client";

import { Activity, Gauge } from "lucide-react";

import { cn } from "@/src/lib/cn";

import type { SpeedSample } from "./speed-test-runner";

const VERDE = "rgb(2,189,48)";
const MORADO = "rgb(106,2,197)";
const VERDE_CLARO = "rgb(114,221,138)";
const MORADO_CLARO = "rgb(164,119,227)";
const NEUTRO_A = "rgb(214,220,228)";
const NEUTRO_B = "rgb(151,160,172)";

const NICE_STEPS = [10, 25, 50, 100, 200, 300, 500, 750, 1000, 2000, 3500];

function niceCeiling(value: number): number {
  const target = Math.max(value * 1.08, 1);
  return (
    NICE_STEPS.find((step) => step >= target) ??
    NICE_STEPS[NICE_STEPS.length - 1]
  );
}

function formatDialValue(value: number) {
  if (value <= 0) {
    return "--";
  }

  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

type SpeedTestDialProps = {
  value: number;
  unit: string;
  caption: string;
  subCaption?: string;
  status?: "idle" | "live" | "measured";
  mode?: "simple" | "technical";
  frameClassName?: string;
};

export function SpeedTestDial({
  value,
  unit,
  caption,
  subCaption,
  status = "idle",
  mode = "technical",
  frameClassName = "relative mx-auto aspect-square w-full max-w-[22rem]",
}: Readonly<SpeedTestDialProps>) {
  const radius = mode === "simple" ? 88 : 86;
  const strokeWidth = mode === "simple" ? 16 : 14;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const max = niceCeiling(value);
  const progress = Math.max(0, Math.min(value / max, 1));
  const palette =
    caption === "Upload"
      ? { start: MORADO_CLARO, end: MORADO, live: MORADO }
      : caption === "Download"
        ? { start: VERDE_CLARO, end: VERDE, live: VERDE }
        : { start: NEUTRO_A, end: NEUTRO_B, live: NEUTRO_B };

  return (
    <div className={cn("relative", frameClassName)}>
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.96)_0%,rgba(250,252,254,0.82)_58%,rgba(255,255,255,0)_78%)]" />
      <div className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(2,189,48,0.06)_0%,rgba(106,2,197,0.05)_48%,transparent_76%)] blur-[12px]" />

      <svg viewBox="0 0 240 240" className="relative h-full w-full rotate-[135deg]">
        <defs>
          <linearGradient id="speedTestDialArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.start} />
            <stop offset="100%" stopColor={palette.end} />
          </linearGradient>
          <filter id="speedTestDialGlow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="rgba(15,23,42,0.055)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />

        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="url(#speedTestDialArc)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength * progress} ${circumference}`}
          filter="url(#speedTestDialGlow)"
          style={{
            transition:
              "stroke-dasharray 650ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease",
          }}
        />
      </svg>

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center text-center",
          mode === "simple" ? "px-12 py-9 sm:px-14" : "px-9 py-6 sm:px-10",
        )}
      >
        <div
          className={cn(
            "font-semibold uppercase tracking-[0.26em] text-ink-faint",
            mode === "simple" ? "text-[0.69rem]" : "text-[0.63rem]",
          )}
        >
          {caption}
        </div>

        <div
          className={cn(
            "flex items-end gap-2",
            mode === "simple" ? "mt-[0.95rem]" : "mt-[0.7rem]",
          )}
        >
          <span
            className={cn(
              "font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums",
              mode === "simple"
                ? "text-[2.5rem] sm:text-[2.85rem]"
                : "text-[2.15rem] sm:text-[2.4rem]",
            )}
          >
            {formatDialValue(value)}
          </span>
          <span
            className={cn(
              "font-medium text-ink-muted",
              mode === "simple" ? "pb-1.5 text-[0.82rem]" : "pb-1 text-[0.72rem]",
            )}
          >
            {unit}
          </span>
        </div>

        {subCaption ? (
          <div
            className={cn(
              "max-w-[11.5rem] leading-5 text-ink-muted",
              mode === "simple"
                ? "mt-[0.85rem] text-[0.77rem]"
                : "mt-[0.6rem] text-[0.7rem]",
            )}
          >
            {subCaption}
          </div>
        ) : null}

        {status !== "idle" ? (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/75 px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft shadow-[0_12px_26px_rgba(206,210,218,0.14)]",
              mode === "simple" ? "mt-4" : "mt-3",
            )}
          >
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                caption === "Upload"
                  ? "bg-brand"
                  : caption === "Download"
                    ? "bg-success"
                    : "bg-ink-faint",
              )}
            >
              {status === "live" ? (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-45"
                  style={{ backgroundColor: palette.live }}
                />
              ) : null}
            </span>
            {status === "live" ? "Live" : "Measured"}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const CHART_W = 640;
const CHART_H = 236;
const PAD_LEFT = 20;
const PAD_RIGHT = 20;
const PAD_TOP = 18;
const PAD_BOTTOM = 24;

function buildPath(
  points: ReadonlyArray<{ x: number; y: number }>,
  close: boolean,
): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const only = points[0];
    const line = `M ${only.x.toFixed(1)} ${only.y.toFixed(1)} L ${(only.x + 0.5).toFixed(1)} ${only.y.toFixed(1)}`;
    return close
      ? `${line} L ${(only.x + 0.5).toFixed(1)} ${CHART_H - PAD_BOTTOM} L ${only.x.toFixed(1)} ${CHART_H - PAD_BOTTOM} Z`
      : line;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midX = (previous.x + current.x) / 2;

    d += ` C ${midX.toFixed(1)} ${previous.y.toFixed(1)}, ${midX.toFixed(1)} ${current.y.toFixed(1)}, ${current.x.toFixed(1)} ${current.y.toFixed(1)}`;
  }

  if (close) {
    const last = points[points.length - 1];
    const first = points[0];
    d += ` L ${last.x.toFixed(1)} ${CHART_H - PAD_BOTTOM} L ${first.x.toFixed(1)} ${CHART_H - PAD_BOTTOM} Z`;
  }

  return d;
}

type SpeedOverTimeChartProps = {
  samples: ReadonlyArray<SpeedSample>;
  heightClass?: string;
};

export function SpeedOverTimeChart({
  samples,
  heightClass = "h-[15rem]",
}: Readonly<SpeedOverTimeChartProps>) {
  const hasData = samples.length > 0;
  const peak = hasData
    ? Math.max(...samples.map((sample) => sample.mbps), 1)
    : 1;
  const ceiling = niceCeiling(peak);
  const span = hasData
    ? Math.max(...samples.map((sample) => sample.elapsed), 1)
    : 1;

  const project = (group: "download" | "upload") => {
    const plotWidth = CHART_W - PAD_LEFT - PAD_RIGHT;
    const plotHeight = CHART_H - PAD_TOP - PAD_BOTTOM;

    return samples
      .filter((sample) => sample.phase === group)
      .map((sample) => ({
        x: PAD_LEFT + (sample.elapsed / span) * plotWidth,
        y:
          PAD_TOP +
          plotHeight -
          (Math.min(sample.mbps, ceiling) / ceiling) * plotHeight,
      }));
  };

  const downloadPoints = project("download");
  const uploadPoints = project("upload");

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(248,250,252,0.66))] px-2 pb-2 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className={`${heightClass} w-full`}
        >
          <defs>
            <linearGradient id="speedChartDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VERDE} stopOpacity="0.28" />
              <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="speedChartUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MORADO} stopOpacity="0.22" />
              <stop offset="100%" stopColor={MORADO} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = PAD_TOP + (CHART_H - PAD_TOP - PAD_BOTTOM) * ratio;
            return (
              <line
                key={ratio}
                x1={PAD_LEFT}
                x2={CHART_W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="rgba(15,23,42,0.05)"
                strokeWidth="1"
                strokeDasharray="3 7"
              />
            );
          })}

          <line
            x1={PAD_LEFT}
            x2={CHART_W - PAD_RIGHT}
            y1={CHART_H - PAD_BOTTOM}
            y2={CHART_H - PAD_BOTTOM}
            stroke="rgba(15,23,42,0.1)"
            strokeWidth="1"
          />

          {hasData ? (
            <>
              <path
                d={buildPath(downloadPoints, true)}
                fill="url(#speedChartDownload)"
              />
              <path
                d={buildPath(uploadPoints, true)}
                fill="url(#speedChartUpload)"
              />

              <path
                d={buildPath(downloadPoints, false)}
                fill="none"
                stroke={VERDE}
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildPath(uploadPoints, false)}
                fill="none"
                stroke={MORADO}
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                { points: downloadPoints, color: VERDE },
                { points: uploadPoints, color: MORADO },
              ].map(({ points, color }) =>
                points.length > 0 ? (
                  <circle
                    key={color}
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="3.2"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.8"
                  />
                ) : null,
              )}
            </>
          ) : null}
        </svg>

        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="rounded-[1.2rem] border border-line/20 bg-white/84 px-5 py-4 text-center shadow-[0_14px_30px_rgba(208,211,218,0.12)]">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-ink-soft">
                <Gauge size={18} strokeWidth={1.9} />
              </span>
              <div className="mt-3 text-[0.96rem] font-medium text-ink">
                Speed over time will appear here
              </div>
              <div className="mt-1 text-[0.82rem] leading-6 text-ink-muted">
                Start a test to compare download and upload behavior across the
                full run.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[0.68rem] font-medium text-ink-faint">
        <span>0s</span>
        <span className="inline-flex items-center gap-1.5">
          <Activity size={12} strokeWidth={1.8} />
          {hasData ? `Peak ${Math.round(peak)} Mbps` : "Peak --"}
        </span>
        <span>{hasData ? `${span.toFixed(1)}s` : "--"}</span>
      </div>
    </div>
  );
}

export { SpeedTestDial as SpeedGauge, SpeedOverTimeChart as SpeedChart };
