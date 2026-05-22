"use client";

import type { SpeedSample } from "./speed-test-runner";

const VERDE = "rgb(2,189,48)";
const MORADO = "rgb(106,2,197)";

const NICE_STEPS = [10, 25, 50, 100, 200, 300, 500, 750, 1000, 2000];

function niceCeiling(value: number): number {
  const target = Math.max(value * 1.08, 1);
  return NICE_STEPS.find((step) => step >= target) ?? NICE_STEPS[NICE_STEPS.length - 1];
}

// --- Circular speed gauge ----------------------------------------------------

type SpeedGaugeProps = {
  value: number;
  unit: string;
  caption: string;
  subCaption?: string;
  active?: boolean;
  /** Sizing wrapper classes. Defaults to a width-driven square. */
  frameClassName?: string;
};

export function SpeedGauge({
  value,
  unit,
  caption,
  subCaption,
  active = false,
  frameClassName = "relative mx-auto aspect-square w-full max-w-[19rem]",
}: Readonly<SpeedGaugeProps>) {
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75; // 270-degree dial
  const arcLength = circumference * arcFraction;

  const max = niceCeiling(value);
  const progress = Math.max(0, Math.min(value / max, 1));

  const display =
    value > 0 ? (value >= 100 ? value.toFixed(0) : value.toFixed(1)) : "--";

  return (
    <div className={frameClassName}>
      <svg viewBox="0 0 240 240" className="h-full w-full rotate-[135deg]">
        <defs>
          <linearGradient id="speedGaugeArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={VERDE} />
            <stop offset="100%" stopColor={MORADO} />
          </linearGradient>
        </defs>
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="rgba(15,23,42,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="url(#speedGaugeArc)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength * progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.2,0.7,0.3,1)" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <div className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-ink-faint">
          {caption}
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-[2.1rem] font-semibold leading-none tracking-[-0.05em] text-ink tabular-nums">
            {display}
          </span>
          <span className="text-[0.72rem] font-medium text-ink-muted">{unit}</span>
        </div>
        {subCaption ? (
          <div className="mt-1 max-w-[8.5rem] text-[0.64rem] leading-4 text-ink-muted">
            {subCaption}
          </div>
        ) : null}
        {active ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-brand" />
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-brand">
              Live
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// --- Speed-over-time chart ---------------------------------------------------

const CHART_W = 640;
const CHART_H = 220;
const PAD_X = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 14;

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
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  if (close) {
    const last = points[points.length - 1];
    const first = points[0];
    d += ` L ${last.x.toFixed(1)} ${CHART_H - PAD_BOTTOM} L ${first.x.toFixed(1)} ${CHART_H - PAD_BOTTOM} Z`;
  }
  return d;
}

type SpeedChartProps = {
  samples: ReadonlyArray<SpeedSample>;
  /** Height class for the plotted SVG. Defaults to the full-size chart. */
  heightClass?: string;
};

export function SpeedChart({
  samples,
  heightClass = "h-[14rem]",
}: Readonly<SpeedChartProps>) {
  const hasData = samples.length > 0;
  const peak = hasData
    ? Math.max(...samples.map((sample) => sample.mbps), 1)
    : 1;
  const ceiling = niceCeiling(peak);
  const span = Math.max(...samples.map((sample) => sample.elapsed), 1);

  const project = (group: "download" | "upload") => {
    const plotW = CHART_W - PAD_X * 2;
    const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
    return samples
      .filter((sample) => sample.phase === group)
      .map((sample) => ({
        x: PAD_X + (sample.elapsed / span) * plotW,
        y: PAD_TOP + plotH - (Math.min(sample.mbps, ceiling) / ceiling) * plotH,
      }));
  };

  const downloadPoints = project("download");
  const uploadPoints = project("upload");

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        className={`${heightClass} w-full`}
      >
        <defs>
          <linearGradient id="speedChartDownload" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VERDE} stopOpacity="0.26" />
            <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="speedChartUpload" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MORADO} stopOpacity="0.2" />
            <stop offset="100%" stopColor={MORADO} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = PAD_TOP + (CHART_H - PAD_TOP - PAD_BOTTOM) * ratio;
          return (
            <line
              key={ratio}
              x1={PAD_X}
              x2={CHART_W - PAD_X}
              y1={y}
              y2={y}
              stroke="rgba(15,23,42,0.05)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          );
        })}
        <line
          x1={PAD_X}
          x2={CHART_W - PAD_X}
          y1={CHART_H - PAD_BOTTOM}
          y2={CHART_H - PAD_BOTTOM}
          stroke="rgba(15,23,42,0.1)"
          strokeWidth="1"
        />

        {hasData ? (
          <>
            <path d={buildPath(downloadPoints, true)} fill="url(#speedChartDownload)" />
            <path d={buildPath(uploadPoints, true)} fill="url(#speedChartUpload)" />
            <path
              d={buildPath(downloadPoints, false)}
              fill="none"
              stroke={VERDE}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildPath(uploadPoints, false)}
              fill="none"
              stroke={MORADO}
              strokeWidth="1.9"
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
                  r="2.8"
                  fill={color}
                  stroke="white"
                  strokeWidth="1.6"
                />
              ) : null,
            )}
          </>
        ) : (
          <text
            x={CHART_W / 2}
            y={CHART_H / 2}
            textAnchor="middle"
            fill="rgb(156,163,175)"
            fontSize="13"
          >
            Run a test to plot your speed over time
          </text>
        )}
      </svg>

      <div className="mt-1.5 flex items-center justify-between font-mono text-[0.64rem] text-ink-faint">
        <span>0s</span>
        <span>{hasData ? `peak ${Math.round(peak)} Mbps` : "--"}</span>
        <span>{hasData ? `${span.toFixed(1)}s` : "--"}</span>
      </div>
    </div>
  );
}
