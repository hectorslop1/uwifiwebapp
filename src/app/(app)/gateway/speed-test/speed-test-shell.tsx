"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  Check,
  Clock,
  Download,
  Gamepad2,
  Gauge,
  Globe,
  Loader2,
  MapPin,
  MonitorPlay,
  Play,
  RotateCcw,
  Server,
  Signal,
  Upload,
  Video,
  Waves,
  Wifi,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { cn } from "@/src/lib/cn";

import {
  rateActivities,
  runSpeedTest,
  type ActivityId,
  type ActivityRating,
  type ActivityTone,
  type SpeedTestPhase,
  type SpeedTestProgress,
  type SpeedTestResults,
  type SpeedTestStage,
} from "./speed-test-runner";
import { SpeedChart, SpeedGauge } from "./speed-test-visuals";

type SpeedTestMode = "simple" | "technical";

type LucideIcon = ComponentType<{ size?: number; strokeWidth?: number }>;

const MODE_STORAGE_KEY = "uwifi.speedtest.mode";

const PHASE_ORDER: SpeedTestPhase[] = [
  "latency",
  "download",
  "upload",
  "stability",
];

const STEPS: ReadonlyArray<{
  phase: SpeedTestPhase;
  label: string;
  icon: LucideIcon;
}> = [
  { phase: "latency", label: "Checking latency", icon: Activity },
  { phase: "download", label: "Testing download", icon: Download },
  { phase: "upload", label: "Testing upload", icon: Upload },
  { phase: "stability", label: "Measuring stability", icon: Waves },
];

const ACTIVITY_ICONS: Record<ActivityId, LucideIcon> = {
  browsing: Globe,
  conferencing: Video,
  gaming: Gamepad2,
  streaming: MonitorPlay,
};

type SpeedTestShellProps = {
  gatewayIp?: string | null;
  connectionLabel?: string;
};

// --- formatting helpers ------------------------------------------------------

function formatMbps(value: number | undefined) {
  if (value === undefined || value <= 0) {
    return "--";
  }
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

function formatMs(value: number | undefined) {
  if (value === undefined || value <= 0) {
    return "--";
  }
  return value.toFixed(0);
}

function formatLossPct(value: number | undefined) {
  if (value === undefined) {
    return "--";
  }
  if (value === 0) {
    return "0";
  }
  return value < 1 ? value.toFixed(1) : value.toFixed(0);
}

function getInitialMode(): SpeedTestMode {
  if (typeof window === "undefined") {
    return "technical";
  }
  const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
  return saved === "simple" || saved === "technical" ? saved : "technical";
}

function stepStatus(
  phase: SpeedTestPhase,
  stage: SpeedTestStage,
): "pending" | "active" | "done" {
  if (stage === "done") {
    return "done";
  }
  const currentIndex = PHASE_ORDER.indexOf(stage as SpeedTestPhase);
  if (currentIndex === -1) {
    return "pending";
  }
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  if (phaseIndex < currentIndex) {
    return "done";
  }
  return phaseIndex === currentIndex ? "active" : "pending";
}

// --- small presentational pieces --------------------------------------------

/**
 * Test-lifecycle indicator. Three explicit visual states so the run feels
 * operational: pending (muted), active (brand glow + spinner), done (check).
 */
function StepChip({
  label,
  icon: Icon,
  status,
}: Readonly<{
  label: string;
  icon: LucideIcon;
  status: "pending" | "active" | "done";
}>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[0.6rem] px-2.5 py-[0.4rem] transition-all duration-300",
        status === "active" &&
          "bg-brand-soft/80 ring-1 ring-brand/25 shadow-[0_4px_14px_rgba(106,2,197,0.1)]",
        status === "done" && "bg-success-soft/40",
        status === "pending" && "bg-[rgba(15,23,42,0.025)] opacity-65",
      )}
    >
      <span
        className={cn(
          "flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-full transition-colors duration-300",
          status === "active" && "bg-brand text-white",
          status === "done" && "bg-success text-white",
          status === "pending" && "bg-[rgba(15,23,42,0.06)] text-ink-faint",
        )}
      >
        {status === "done" ? (
          <Check size={11} strokeWidth={2.6} />
        ) : status === "active" ? (
          <Loader2 size={11} strokeWidth={2.4} className="animate-spin" />
        ) : (
          <Icon size={10} strokeWidth={2} />
        )}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[0.73rem] transition-colors duration-300",
          status === "active" && "font-semibold text-brand",
          status === "done" && "font-medium text-ink",
          status === "pending" && "font-medium text-ink-muted",
        )}
      >
        {label}
      </span>
      {status === "active" ? (
        <span className="flex shrink-0 items-center gap-[3px]">
          <span className="h-1 w-1 animate-bounce rounded-full bg-brand [animation-delay:-0.24s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-brand [animation-delay:-0.12s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-brand" />
        </span>
      ) : status === "done" ? (
        <span className="shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-success">
          Done
        </span>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  accent,
}: Readonly<{
  label: string;
  value: string;
  unit: string;
  hint: string;
  icon: LucideIcon;
  accent: "green" | "violet" | "neutral";
}>) {
  const accentClass =
    accent === "green"
      ? "bg-success-soft text-success"
      : accent === "violet"
        ? "bg-brand-soft text-brand"
        : "bg-[#f1f1f3] text-ink-soft";

  return (
    <SurfacePanel subtle className="p-2.5">
      {/* Icon + label share one baseline-aligned row -- consistent across all cards. */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-[0.45rem]",
            accentClass,
          )}
        >
          <Icon size={12} strokeWidth={2} />
        </span>
        <span className="min-w-0 truncate text-[0.62rem] font-semibold uppercase tracking-[0.07em] text-ink-faint">
          {label}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[1.4rem] font-semibold leading-none tracking-[-0.045em] text-ink tabular-nums">
          {value}
        </span>
        <span className="text-[0.64rem] font-medium text-ink-muted">
          {unit}
        </span>
      </div>
      <div className="mt-1 truncate text-[0.64rem] leading-4 text-ink-muted">
        {hint}
      </div>
    </SurfacePanel>
  );
}

function ActivityMeter({
  score,
  tone,
}: Readonly<{ score: number; tone: ActivityTone }>) {
  const fillClass =
    tone === "success"
      ? "bg-success"
      : tone === "brand"
        ? "bg-brand"
        : "bg-[#d99a2b]";

  return (
    <div className="flex shrink-0 gap-[3px]">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={cn(
            "h-1 w-3 rounded-full transition-colors duration-300",
            index < score ? fillClass : "bg-[rgba(15,23,42,0.09)]",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Compact telemetry row -- every activity uses the same scoring system:
 * icon, label + helper, 4-segment meter and a dot-prefixed verdict chip.
 */
function ActivityRow({ rating }: Readonly<{ rating: ActivityRating }>) {
  const Icon = ACTIVITY_ICONS[rating.id];
  const pillClass =
    rating.tone === "success"
      ? "bg-success-soft text-success"
      : rating.tone === "brand"
        ? "bg-brand-soft text-brand"
        : "bg-[#f8f0df] text-[#996a16]";
  const dotClass =
    rating.tone === "success"
      ? "bg-success"
      : rating.tone === "brand"
        ? "bg-brand"
        : "bg-[#d99a2b]";

  return (
    <div className="flex items-center gap-2.5 py-[0.45rem]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] bg-[rgba(15,23,42,0.04)] text-ink-soft">
        <Icon size={14} strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[0.78rem] font-medium leading-tight text-ink">
          {rating.label}
        </span>
        <span className="block truncate text-[0.65rem] leading-tight text-ink-muted">
          {rating.detail}
        </span>
      </div>
      <ActivityMeter score={rating.score} tone={rating.tone} />
      <span
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-pill px-2 py-[0.15rem] text-[0.65rem] font-medium",
          pillClass,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
        {rating.verdict}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: Readonly<{ label: string; value: string; icon: LucideIcon }>) {
  return (
    <div className="flex items-center justify-between gap-4 py-[0.35rem]">
      <span className="flex items-center gap-2 text-[0.72rem] text-ink-muted">
        <Icon size={12} strokeWidth={1.8} />
        {label}
      </span>
      <span className="truncate text-[0.78rem] font-medium text-ink">
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: Readonly<{ children: string }>) {
  return (
    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-ink-faint">
      {children}
    </span>
  );
}

// --- main component ----------------------------------------------------------

export function SpeedTestShell({
  gatewayIp,
  connectionLabel = "Wi-Fi · gateway link",
}: Readonly<SpeedTestShellProps>) {
  const [mode, setMode] = useState<SpeedTestMode>(getInitialMode);
  const [stage, setStage] = useState<SpeedTestStage>("idle");
  const [progress, setProgress] = useState<SpeedTestProgress | null>(null);
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const changeMode = (next: SpeedTestMode) => {
    setMode(next);
    window.localStorage.setItem(MODE_STORAGE_KEY, next);
  };

  const isRunning =
    stage === "latency" ||
    stage === "download" ||
    stage === "upload" ||
    stage === "stability";

  const runTest = async () => {
    if (isRunning) {
      return;
    }
    setErrorMessage("");
    setResults(null);
    setProgress(null);
    setStage("latency");

    try {
      const outcome = await runSpeedTest((update) => {
        setProgress(update);
        setStage(update.stage);
      });
      setResults(outcome);
      setStage("done");
    } catch (error) {
      setStage("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The speed test could not finish right now.",
      );
    }
  };

  const partial = progress?.partial;
  const activities = results ? rateActivities(results) : null;
  const isTechnical = mode === "technical";

  // Gauge content for the current stage.
  const gauge = (() => {
    switch (stage) {
      case "latency":
        return {
          value: partial?.pingMs ?? 0,
          unit: "ms",
          caption: "Latency",
          subCaption: "Checking responsiveness",
        };
      case "download":
        return {
          value: progress?.liveMbps ?? 0,
          unit: "Mbps",
          caption: "Download",
          subCaption: "Measuring download speed",
        };
      case "upload":
        return {
          value: progress?.liveMbps ?? 0,
          unit: "Mbps",
          caption: "Upload",
          subCaption: "Measuring upload speed",
        };
      case "stability":
        return {
          value: partial?.downloadMbps ?? 0,
          unit: "Mbps",
          caption: "Download",
          subCaption: "Checking network stability",
        };
      case "done":
        return {
          value: results?.downloadMbps ?? 0,
          unit: "Mbps",
          caption: "Download",
          subCaption: "Test complete",
        };
      case "error":
        return {
          value: 0,
          unit: "Mbps",
          caption: "Stopped",
          subCaption: "Test could not finish",
        };
      default:
        return {
          value: 0,
          unit: "Mbps",
          caption: "Ready",
          subCaption: "Start a test to measure your line",
        };
    }
  })();

  const statusPill = (() => {
    if (isRunning) {
      return <StatusPill label="Running test" tone="brand" pulse />;
    }
    if (stage === "done") {
      return <StatusPill label="Test complete" tone="success" pulse />;
    }
    if (stage === "error") {
      return <StatusPill label="Test stopped" tone="error" />;
    }
    return <StatusPill label="Ready to test" tone="success" pulse />;
  })();

  const startLabel = isRunning
    ? "Testing…"
    : stage === "done" || stage === "error"
      ? "Run test again"
      : "Start test";

  const metrics: ReadonlyArray<{
    key: string;
    label: string;
    value: string;
    unit: string;
    hint: string;
    icon: LucideIcon;
    accent: "green" | "violet" | "neutral";
    technicalOnly?: boolean;
  }> = [
    {
      key: "download",
      label: "Download",
      value: formatMbps(results?.downloadMbps),
      unit: "Mbps",
      hint: "Speed data reaches this device.",
      icon: Download,
      accent: "green",
    },
    {
      key: "upload",
      label: "Upload",
      value: formatMbps(results?.uploadMbps),
      unit: "Mbps",
      hint: "Speed this device sends data out.",
      icon: Upload,
      accent: "violet",
    },
    {
      key: "ping",
      label: "Ping",
      value: formatMs(results?.pingMs),
      unit: "ms",
      hint: "Round-trip response time.",
      icon: Gauge,
      accent: "neutral",
    },
    {
      key: "jitter",
      label: "Jitter",
      value: formatMs(results?.jitterMs),
      unit: "ms",
      hint: "Variation between ping samples.",
      icon: Activity,
      accent: "neutral",
      technicalOnly: true,
    },
    {
      key: "loss",
      label: "Packet loss",
      value: formatLossPct(results?.packetLossPct),
      unit: "%",
      hint: "Requests that never returned.",
      icon: Signal,
      accent: "neutral",
      technicalOnly: true,
    },
  ];

  const visibleMetrics = metrics.filter(
    (metric) => isTechnical || !metric.technicalOnly,
  );

  const testedAt = results
    ? new Date(results.finishedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not run yet";

  return (
    <div className="flex flex-col gap-2.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
      {/* Header -- compact, fixed height */}
      <PageIntro
        className="shrink-0"
        eyebrow="Gateway"
        title="Speed test"
        description="Measure your connection speed, latency and network stability in real time."
        actions={
          <div className="w-full sm:w-[16rem]">
            <SegmentedControl<SpeedTestMode>
              value={mode}
              onChange={changeMode}
              options={[
                { value: "simple", label: "Simple" },
                { value: "technical", label: "Technical" },
              ]}
            />
          </div>
        }
      />

      {stage === "error" && errorMessage ? (
        <div className="shrink-0 rounded-[1rem] border border-[#f0d4cf] bg-[rgba(252,244,241,0.92)] px-3.5 py-2 text-body-sm text-[#c86c58]">
          {errorMessage}
        </div>
      ) : null}

      {/* Body -- two columns that fill the remaining viewport height on desktop.
          Left  : test hero -> KPI results -> speed chart.
          Right : activity readiness -> network details. */}
      <div className="grid gap-2.5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-2.5 lg:min-h-0 lg:overflow-hidden">
          {/* Test hero -- dial and Start control sit side by side */}
          <SurfacePanel className="flex flex-col p-3.5 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              {statusPill}
              <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-ink-muted">
                <Server size={12} strokeWidth={1.8} />
                U-wifi portal node
              </span>
            </div>

            <div className="mt-2.5 flex min-h-0 flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {/* Dial -- compact, scales to the space available */}
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <SpeedGauge
                  value={gauge.value}
                  unit={gauge.unit}
                  caption={gauge.caption}
                  subCaption={gauge.subCaption}
                  active={isRunning}
                  frameClassName="relative mx-auto aspect-square w-full max-w-[9.5rem] sm:max-w-[10.5rem] lg:h-full lg:max-h-[11.5rem] lg:w-auto lg:max-w-full"
                />
              </div>

              {/* Control column -- Start button + progress steps */}
              <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-[13.5rem]">
                <button
                  type="button"
                  onClick={runTest}
                  disabled={isRunning}
                  className="theme-cta inline-flex w-full items-center justify-center gap-1.5 rounded-pill border px-5 py-2 text-[0.8rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {stage === "done" || stage === "error" ? (
                    <RotateCcw size={14} strokeWidth={2} />
                  ) : (
                    <Play size={14} strokeWidth={2} />
                  )}
                  {startLabel}
                </button>
                <div className="flex flex-col gap-1">
                  {STEPS.map((step) => (
                    <StepChip
                      key={step.phase}
                      label={step.label}
                      icon={step.icon}
                      status={stepStatus(step.phase, stage)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SurfacePanel>

          {/* KPI results -- placed directly under the test area, above the chart */}
          <div className="shrink-0">
            <div className="mb-1.5 flex items-baseline justify-between">
              <SectionLabel>Results</SectionLabel>
              {results ? (
                <span className="text-[0.7rem] text-ink-muted">
                  Stability {results.stabilityPct}/100
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                "grid grid-cols-3 gap-2",
                isTechnical && "sm:grid-cols-5",
              )}
            >
              {visibleMetrics.map((metric) => (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={metric.value}
                  unit={metric.unit}
                  hint={metric.hint}
                  icon={metric.icon}
                  accent={metric.accent}
                />
              ))}
            </div>
          </div>

          {/* Speed-over-time chart -- technical mode only */}
          {isTechnical ? (
            <SurfacePanel subtle className="shrink-0 p-3">
              <div className="mb-0.5 flex items-center justify-between">
                <SectionLabel>Speed over time</SectionLabel>
                <span className="flex items-center gap-3 text-[0.68rem] text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-success" />
                    Download
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-brand" />
                    Upload
                  </span>
                </span>
              </div>
              <SpeedChart
                samples={progress?.samples ?? results?.samples ?? []}
                heightClass="h-[6rem]"
              />
            </SurfacePanel>
          ) : null}
        </div>

        {/* RIGHT COLUMN -- activity readiness + network details */}
        <div className="flex flex-col gap-2.5 lg:min-h-0 lg:overflow-hidden">
          {/* Activity readiness */}
          <SurfacePanel className="flex flex-col p-3.5 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line/12 pb-2.5">
              <div>
                <div className="text-[0.92rem] font-semibold leading-tight text-ink">
                  Ready for
                </div>
                <div className="text-[0.68rem] text-ink-muted">
                  How your line handles everyday use
                </div>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] bg-[rgba(15,23,42,0.04)] text-ink-faint">
                <Wifi size={14} strokeWidth={1.8} />
              </span>
            </div>

            {activities ? (
              <div className="flex min-h-0 flex-1 flex-col justify-center divide-y divide-line/12">
                {activities.map((rating) => (
                  <ActivityRow key={rating.id} rating={rating} />
                ))}
              </div>
            ) : (
              <div className="mt-2.5 flex min-h-0 flex-1 items-center justify-center rounded-[0.9rem] border border-dashed border-line/30 px-5 text-center text-[0.74rem] leading-5 text-ink-muted">
                Run a test to see how your connection handles browsing, calls,
                gaming and streaming.
              </div>
            )}
          </SurfacePanel>

          {/* Network details -- technical mode only */}
          {isTechnical ? (
            <SurfacePanel subtle className="shrink-0 p-3.5">
              <div className="mb-1 text-[0.92rem] font-semibold leading-tight text-ink">
                Network details
              </div>
              <div className="divide-y divide-line/12">
                <DetailRow
                  label="Test server"
                  value="U-wifi portal node"
                  icon={Server}
                />
                <DetailRow label="Provider" value="U-wifi" icon={Wifi} />
                <DetailRow
                  label="IP address"
                  value={gatewayIp ? gatewayIp : "Not available"}
                  icon={MapPin}
                />
                <DetailRow
                  label="Connection"
                  value={connectionLabel}
                  icon={Globe}
                />
                <DetailRow label="Tested" value={testedAt} icon={Clock} />
              </div>
            </SurfacePanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
