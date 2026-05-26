"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

import { cn } from "@/src/lib/cn";

import type { SpeedSample } from "./speed-test-runner";

// U-wifi brand: exact hex values for primary screen accents
const VERDE = "#69c45f";
const MORADO = "#682cd0";
const VERDE_CLARO = "#9ad793";
const MORADO_CLARO = "#a98ce4";
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
  frameClassName = "relative mx-auto aspect-square w-full max-w-[25rem]",
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
    <div className="flex flex-col items-center w-full">
      {/* Title above the dial with a spacious margin */}
      <div className={cn("text-center shrink-0", mode === "simple" ? "mb-5 sm:mb-6" : "mb-3.5 sm:mb-4")}>
        <div
          className={cn(
            "font-bold uppercase tracking-[0.22em] text-ink-muted",
            mode === "simple" ? "text-[0.8rem] sm:text-[0.88rem]" : "text-[0.72rem] sm:text-[0.78rem]"
          )}
        >
          {caption === "Download" ? "Download Speed" : caption === "Upload" ? "Upload Speed" : caption}
        </div>
        {subCaption ? (
          <div
            className={cn(
              "mt-0.5 text-ink-faint font-medium",
              mode === "simple" ? "text-[0.72rem] sm:text-[0.78rem]" : "text-[0.64rem] sm:text-[0.7rem]"
            )}
          >
            {subCaption}
          </div>
        ) : null}
      </div>

      <div className={cn("relative w-full", frameClassName)}>
        <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.96)_0%,rgba(250,252,254,0.82)_58%,rgba(255,255,255,0)_78%)]" />
        <div className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(105,196,95,0.07)_0%,rgba(104,44,208,0.06)_48%,transparent_76%)] blur-[12px]" />

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
            mode === "simple" ? "px-10 pb-4 sm:px-12" : "px-7 pb-3 sm:px-9",
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <span
              className={cn(
                "font-bold leading-none tracking-[-0.04em] text-ink tabular-nums text-center",
                mode === "simple"
                  ? "text-[2.8rem] sm:text-[3.2rem]"
                  : "text-[2.2rem] sm:text-[2.5rem]",
              )}
            >
              {formatDialValue(value)}
            </span>
            <span
              className={cn(
                "font-bold text-ink-muted uppercase tracking-[0.16em] text-center mt-1 sm:mt-1.5",
                mode === "simple" ? "text-[0.72rem]" : "text-[0.66rem]",
              )}
            >
              {unit}
            </span>
          </div>

          {status !== "idle" ? (
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/75 px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft shadow-[0_12px_26px_rgba(206,210,218,0.14)] whitespace-nowrap",
                mode === "simple" ? "bottom-4 sm:bottom-5" : "bottom-2 sm:bottom-3",
              )}
            >
              <span
                className={cn(
                  "relative inline-flex h-2.5 w-2.5 rounded-full",
                  caption === "Upload"
                    ? "bg-[#682cd0]"
                    : caption === "Download"
                      ? "bg-[#69c45f]"
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
              {status === "live" ? "Live" : "Test complete"}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const CHART_W = 640;
const CHART_H = 240;
const PAD_LEFT = 16;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;
const BAND_GAP = 10;

function buildPath(
  points: ReadonlyArray<{ x: number; y: number }>,
  close: boolean,
  baselineY: number,
): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const only = points[0];
    const line = `M ${only.x.toFixed(1)} ${only.y.toFixed(1)} L ${(only.x + 0.5).toFixed(1)} ${only.y.toFixed(1)}`;
    return close
      ? `${line} L ${(only.x + 0.5).toFixed(1)} ${baselineY} L ${only.x.toFixed(1)} ${baselineY} Z`
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
    d += ` L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }

  return d;
}

type ChartState = "idle" | "running" | "completed";

type SpeedOverTimeChartProps = {
  samples?: ReadonlyArray<SpeedSample>;
  state?: ChartState;
  /**
   * @deprecated Historical view is no longer rendered. The prop stays in the
   * public API for compatibility, but the chart now only renders the live
   * test trace from `samples` so the completed state matches what the user
   * saw during the run.
   */
  history?: ReadonlyArray<{ download_speed: number; upload_speed: number; created_at?: string }>;
  heightClass?: string;
};

function formatTooltipMbps(value: number) {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}



export function SpeedOverTimeChart({
  samples = [],
  state = "idle",
  heightClass = "h-[10.5rem]",
}: Readonly<SpeedOverTimeChartProps>) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const hasData = samples.length > 0;

  const downloadSamples = useMemo(
    () => samples.filter((sample) => sample.phase === "download"),
    [samples],
  );
  const uploadSamples = useMemo(
    () => samples.filter((sample) => sample.phase === "upload"),
    [samples],
  );

  const downloadPeak =
    downloadSamples.length > 0
      ? Math.max(...downloadSamples.map((sample) => sample.mbps), 1)
      : 1;
  const uploadPeak =
    uploadSamples.length > 0
      ? Math.max(...uploadSamples.map((sample) => sample.mbps), 1)
      : 1;

  const downloadCeiling = niceCeiling(downloadPeak);
  const uploadCeiling = niceCeiling(uploadPeak);

  const span = hasData
    ? Math.max(...samples.map((sample) => sample.elapsed), 1)
    : 1;

  const plotWidth = CHART_W - PAD_LEFT - PAD_RIGHT;
  const plotHeight = CHART_H - PAD_TOP - PAD_BOTTOM;
  const plotBottomY = PAD_TOP + plotHeight;

  // Stacked visual bands: Download lives in the upper half, Upload in the
  // lower half. Each band has its own baseline → ceiling → so a 5 Mbps upload
  // trace fills its band just like a 150 Mbps download trace fills its own.
  // The math is rendering-only — tooltips, peaks and the footer still surface
  // real sample.mbps values.
  const bandHeight = (plotHeight - BAND_GAP) / 2;
  const downloadBaseY = PAD_TOP + bandHeight;
  const uploadBaseY = plotBottomY;

  const downloadMeasured = downloadSamples.map((sample) => ({
    x: PAD_LEFT + (sample.elapsed / span) * plotWidth,
    y:
      downloadBaseY -
      (Math.min(sample.mbps, downloadCeiling) / downloadCeiling) * bandHeight,
    sample,
  }));
  const uploadMeasured = uploadSamples.map((sample) => ({
    x: PAD_LEFT + (sample.elapsed / span) * plotWidth,
    y:
      uploadBaseY -
      (Math.min(sample.mbps, uploadCeiling) / uploadCeiling) * bandHeight,
    sample,
  }));

  // Anchor each trace at its band baseline (0 Mbps at x=0) so the line rises
  // from rest into the measured samples instead of starting mid-air.
  const downloadPoints =
    downloadMeasured.length > 0
      ? [{ x: PAD_LEFT, y: downloadBaseY }, ...downloadMeasured]
      : [];
  const uploadPoints =
    uploadMeasured.length > 0
      ? [{ x: PAD_LEFT, y: uploadBaseY }, ...uploadMeasured]
      : [];

  // Peak markers (completed state) — by real Mbps within each phase.
  const downloadPeakPoint =
    downloadMeasured.length > 0
      ? downloadMeasured.reduce((max, current) =>
          current.sample.mbps > max.sample.mbps ? current : max,
        )
      : null;
  const uploadPeakPoint =
    uploadMeasured.length > 0
      ? uploadMeasured.reduce((max, current) =>
          current.sample.mbps > max.sample.mbps ? current : max,
        )
      : null;

  // Latest-active marker (running state) — the most recent sample of the
  // currently-running phase. samples is chronological so the tail is freshest.
  const latestSample =
    samples.length > 0 ? samples[samples.length - 1] : null;
  const latestPoint = (() => {
    if (!latestSample) return null;
    const arr =
      latestSample.phase === "upload" ? uploadMeasured : downloadMeasured;
    return arr.length > 0 ? arr[arr.length - 1] : null;
  })();
  const latestColor = latestSample?.phase === "upload" ? MORADO : VERDE;

  const hoverSample = hoverIndex !== null ? samples[hoverIndex] : null;
  const hoverX =
    hoverSample !== null
      ? PAD_LEFT + (hoverSample.elapsed / span) * plotWidth
      : null;
  const hoverIsUpload = hoverSample?.phase === "upload";
  const hoverCeiling = hoverIsUpload ? uploadCeiling : downloadCeiling;
  const hoverBaseY = hoverIsUpload ? uploadBaseY : downloadBaseY;
  const hoverY =
    hoverSample !== null
      ? hoverBaseY -
        (Math.min(hoverSample.mbps, hoverCeiling) / hoverCeiling) * bandHeight
      : null;
  const hoverColor = hoverIsUpload ? MORADO : VERDE;

  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!hasData) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const viewBoxX = ratio * CHART_W;

    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let index = 0; index < samples.length; index += 1) {
      const sx = PAD_LEFT + (samples[index].elapsed / span) * plotWidth;
      const dist = Math.abs(sx - viewBoxX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = index;
      }
    }
    setHoverIndex(nearestIndex);
  };

  const handleSvgLeave = () => setHoverIndex(null);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.66))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className={`${heightClass} w-full`}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={handleSvgLeave}
        >
          <defs>
            <linearGradient id="speedChartDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VERDE} stopOpacity="0.36" />
              <stop offset="65%" stopColor={VERDE} stopOpacity="0.14" />
              <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="speedChartUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MORADO} stopOpacity="0.30" />
              <stop offset="65%" stopColor={MORADO} stopOpacity="0.12" />
              <stop offset="100%" stopColor={MORADO} stopOpacity="0" />
            </linearGradient>
            <filter id="speedChartDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Subtle band baselines — replace the visible Y axes. Each line
             marks the 0 Mbps level of its trace's band, giving the eye a
             faint anchor without adding numeric chrome. */}
          <line
            x1={PAD_LEFT}
            x2={CHART_W - PAD_RIGHT}
            y1={downloadBaseY}
            y2={downloadBaseY}
            stroke="rgba(15,23,42,0.05)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <line
            x1={PAD_LEFT}
            x2={CHART_W - PAD_RIGHT}
            y1={uploadBaseY}
            y2={uploadBaseY}
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="1"
          />

          {hasData ? (
            <>
              {/* Area fills first so lines paint on top */}
              {downloadPoints.length > 0 ? (
                <path
                  d={buildPath(downloadPoints, true, downloadBaseY)}
                  fill="url(#speedChartDownload)"
                />
              ) : null}
              {uploadPoints.length > 0 ? (
                <path
                  d={buildPath(uploadPoints, true, uploadBaseY)}
                  fill="url(#speedChartUpload)"
                />
              ) : null}

              {downloadPoints.length > 0 ? (
                <path
                  d={buildPath(downloadPoints, false, downloadBaseY)}
                  fill="none"
                  stroke={VERDE}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {uploadPoints.length > 0 ? (
                <path
                  d={buildPath(uploadPoints, false, uploadBaseY)}
                  fill="none"
                  stroke={MORADO}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Dot strategy:
                 - state="running": pulse the latest sample of the active phase
                 - state="completed": peak dot per trace
                 - hover: hover dot (rendered last, on top)
                 No per-sample dots — keeps the trace clean and premium. */}
              {state === "running" && latestPoint ? (
                <g>
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="6"
                    fill={latestColor}
                    opacity="0.22"
                    filter="url(#speedChartDotGlow)"
                  >
                    <animate
                      attributeName="r"
                      values="5;9;5"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.25;0;0.25"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="4"
                    fill={latestColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              ) : null}

              {state === "completed" && downloadPeakPoint ? (
                <circle
                  cx={downloadPeakPoint.x}
                  cy={downloadPeakPoint.y}
                  r="4"
                  fill={VERDE}
                  stroke="white"
                  strokeWidth="2"
                />
              ) : null}
              {state === "completed" && uploadPeakPoint ? (
                <circle
                  cx={uploadPeakPoint.x}
                  cy={uploadPeakPoint.y}
                  r="4"
                  fill={MORADO}
                  stroke="white"
                  strokeWidth="2"
                />
              ) : null}

              {hoverX !== null && hoverY !== null ? (
                <g>
                  <line
                    x1={hoverX}
                    x2={hoverX}
                    y1={PAD_TOP}
                    y2={plotBottomY}
                    stroke="rgba(15,23,42,0.18)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <circle
                    cx={hoverX}
                    cy={hoverY}
                    r="5"
                    fill="white"
                    stroke={hoverColor}
                    strokeWidth="2.4"
                  />
                </g>
              ) : null}
            </>
          ) : null}
        </svg>

        {hasData && hoverSample && hoverX !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-[0.8rem] border border-white/85 bg-white/95 px-2.5 py-1.5 text-left shadow-[0_14px_28px_rgba(15,23,42,0.12)] backdrop-blur"
            style={{
              left: `${(hoverX / CHART_W) * 100}%`,
              top: "0.45rem",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: hoverColor }}
              />
              <span
                className="text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                style={{ color: hoverIsUpload ? "#5421a8" : "#3f8a36" }}
              >
                {hoverIsUpload ? "Upload" : "Download"}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1 tabular-nums">
              <span className="text-[0.92rem] font-bold leading-none text-ink">
                {formatTooltipMbps(hoverSample.mbps)}
              </span>
              <span className="text-[0.62rem] font-medium text-ink-muted">
                Mbps
              </span>
            </div>
            <div className="mt-0.5 text-[0.6rem] font-medium text-ink-faint tabular-nums">
              {hoverSample.elapsed.toFixed(1)}s
            </div>
          </div>
        ) : null}

        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="rounded-[1.05rem] border border-line/20 bg-white/84 px-4 py-2.5 text-center shadow-[0_14px_30px_rgba(208,211,218,0.12)]">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-ink-soft">
                <Activity size={14} strokeWidth={1.9} />
              </span>
              <div className="mt-2 text-[0.82rem] font-medium text-ink">
                Connection trace will appear here
              </div>
              <div className="mt-0.5 text-[0.68rem] leading-5 text-ink-muted">
                Start a test to see live download and upload behavior.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[0.66rem] font-medium text-ink-faint">
        <span>{hasData ? "0s" : "--"}</span>
        <span className="inline-flex items-center gap-3 tabular-nums">
          {downloadSamples.length > 0 ? (
            <span className="inline-flex items-center gap-1.5" style={{ color: "#3f8a36" }}>
              <Activity size={11} strokeWidth={2} />
              Peak {Math.round(downloadPeak)} Mbps
            </span>
          ) : null}
          {uploadSamples.length > 0 ? (
            <span className="inline-flex items-center gap-1.5" style={{ color: "#5421a8" }}>
              <Activity size={11} strokeWidth={2} />
              Peak {Math.round(uploadPeak)} Mbps
            </span>
          ) : null}
          {!hasData ? (
            <span className="inline-flex items-center gap-1.5">
              <Activity size={12} strokeWidth={1.8} />
              Peak --
            </span>
          ) : null}
        </span>
        <span>{hasData ? `${span.toFixed(1)}s` : "--"}</span>
      </div>
    </div>
  );
}

export { SpeedTestDial as SpeedGauge, SpeedOverTimeChart as SpeedChart };
