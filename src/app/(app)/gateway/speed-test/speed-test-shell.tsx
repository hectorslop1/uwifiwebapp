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

type LucideIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

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
        "flex items-center gap-2 rounded-[0.9rem] border px-2.5 py-[0.45rem] transition-all duration-300",
        status === "active" &&
          "border-brand/12 bg-[linear-gradient(180deg,rgba(248,243,255,0.98),rgba(242,236,252,0.94))] shadow-[0_10px_24px_rgba(106,2,197,0.08)]",
        status === "done" &&
          "border-success/12 bg-[linear-gradient(180deg,rgba(247,255,248,0.98),rgba(239,251,242,0.94))] shadow-[0_10px_24px_rgba(2,189,48,0.06)]",
        status === "pending" &&
          "border-line/25 bg-[rgba(248,249,251,0.86)] opacity-90",
      )}
    >
      <span
        className={cn(
          "flex h-[1.2rem] w-[1.2rem] shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
          status === "active" &&
            "border-brand/12 bg-brand-soft text-brand shadow-[0_0_0_4px_rgba(106,2,197,0.07)]",
          status === "done" &&
            "border-success/12 bg-success-soft text-success shadow-[0_0_0_4px_rgba(2,189,48,0.07)]",
          status === "pending" &&
            "border-line/40 bg-white/80 text-ink-faint",
        )}
      >
        {status === "done" ? (
          <Check size={11} strokeWidth={2.5} />
        ) : status === "active" ? (
          <Loader2 size={11} strokeWidth={2.3} className="animate-spin" />
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
  compact = false,
}: Readonly<{
  label: string;
  value: string;
  unit: string;
  hint: string;
  icon: LucideIcon;
  accent: "green" | "violet" | "neutral";
  compact?: boolean;
}>) {
  const accentClass =
    accent === "green"
      ? "bg-success-soft text-success"
      : accent === "violet"
        ? "bg-brand-soft text-brand"
        : "bg-[#f3f4f6] text-ink-soft";

  const glowClass =
    accent === "green"
      ? "bg-[radial-gradient(circle_at_top,rgba(2,189,48,0.1),transparent_70%)]"
      : accent === "violet"
        ? "bg-[radial-gradient(circle_at_top,rgba(106,2,197,0.1),transparent_70%)]"
        : "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_70%)]";

  return (
    <SurfacePanel
      subtle
      className={cn(
        "relative overflow-hidden",
        compact ? "p-2.5" : "p-2.5",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-4 top-0 h-14 rounded-b-[1.2rem]",
          glowClass,
        )}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-[0.45rem] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
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
          <span
            className={cn(
              "font-semibold leading-none tracking-[-0.045em] text-ink tabular-nums",
              compact ? "text-[1.32rem]" : "text-[1.4rem]",
            )}
          >
            {value}
          </span>
          <span className="text-[0.64rem] font-medium text-ink-muted">
            {unit}
          </span>
        </div>
        <div
          className={cn(
            "mt-1 text-[0.64rem] leading-4 text-ink-muted",
            compact ? "truncate" : "truncate",
          )}
        >
          {hint}
        </div>
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
        : tone === "warning"
          ? "bg-[#d99a2b]"
          : "bg-[#df4d43]";

  return (
    <div className="flex shrink-0 gap-[4px]">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={cn(
            "h-[5px] w-4 rounded-full transition-colors duration-300",
            index < score ? fillClass : "bg-[rgba(15,23,42,0.08)]",
          )}
        />
      ))}
    </div>
  );
}

function ActivityRow({ rating }: Readonly<{ rating: ActivityRating }>) {
  const Icon = ACTIVITY_ICONS[rating.id];
  const toneClass =
    rating.tone === "warning"
      ? "bg-[#fdf1dc] text-[#d17b00]"
      : rating.tone === "danger"
        ? "bg-[#fff0ef] text-[#df4d43]"
        : rating.id === "conferencing" || rating.id === "streaming"
          ? "bg-brand-soft text-brand"
          : "bg-success-soft text-success";

  return (
    <div className="flex items-center gap-2.5 py-[0.5rem]">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.7rem] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]",
          toneClass,
        )}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] font-semibold leading-tight text-ink">
          {rating.label}
        </span>
        <div className="mt-[0.45rem]">
          <ActivityMeter score={rating.score} tone={rating.tone} />
        </div>
      </div>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-[0.7rem] font-semibold",
          toneClass,
        )}
      >
        <Check size={11} strokeWidth={2.8} />
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
    <div className="flex items-center justify-between gap-4 py-[0.45rem]">
      <span className="flex items-center gap-2 text-[0.72rem] text-ink-muted">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.65rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,247,250,0.88))] text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
          <Icon size={12} strokeWidth={1.8} />
        </span>
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
  const readyCount = activities
    ? activities.filter((rating) => rating.score >= 3).length
    : 0;
  const isTechnical = mode === "technical";

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

      <div className="grid gap-2.5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
        <div className="flex flex-col gap-2.5 lg:min-h-0 lg:overflow-hidden">
          <SurfacePanel className="flex flex-col p-3.5 lg:min-h-0 lg:overflow-hidden">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              {statusPill}
              <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-ink-muted">
                <Server size={12} strokeWidth={1.8} />
                U-wifi portal node
              </span>
            </div>

            {isTechnical ? (
              <div className="mt-2.5 flex min-h-0 flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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

                <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-[13.5rem]">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={isRunning}
                    className="theme-cta inline-flex w-full items-center justify-center gap-1.5 rounded-[1rem] border px-5 py-2 text-[0.8rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
            ) : (
              <div className="mt-2.5 flex min-h-0 flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <SpeedGauge
                    value={gauge.value}
                    unit={gauge.unit}
                    caption={gauge.caption}
                    subCaption={gauge.subCaption}
                    active={isRunning}
                    frameClassName="relative mx-auto aspect-square w-full max-w-[11.75rem] sm:max-w-[12.8rem] lg:h-full lg:max-h-[14.2rem] lg:w-auto lg:max-w-full"
                  />
                </div>

                <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-[14rem]">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={isRunning}
                    className="theme-cta inline-flex w-full items-center justify-center gap-1.5 rounded-[1rem] border px-5 py-2.5 text-[0.84rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
            )}
          </SurfacePanel>

          {isTechnical ? (
            <div className="shrink-0">
              <div className="mb-1.5 flex items-baseline justify-between">
                <SectionLabel>Results</SectionLabel>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
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
          ) : null}

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

        <div className="flex flex-col gap-2.5 lg:min-h-0 lg:overflow-hidden">
          <SurfacePanel className="flex flex-col p-3.5 lg:min-h-0 lg:overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line/12 pb-2.5">
              <div>
                <div className="text-[0.92rem] font-semibold leading-tight text-ink">
                  Ready for
                </div>
                <div className="text-[0.68rem] text-ink-muted">
                  Everyday activities at home
                </div>
              </div>
              {activities ? (
                <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-success-soft px-2.5 py-1 text-[0.72rem] font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {readyCount} / {activities.length}
                </span>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] bg-[rgba(15,23,42,0.04)] text-ink-faint">
                  <Wifi size={14} strokeWidth={1.8} />
                </span>
              )}
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
                  label="Gateway IP"
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
          ) : (
            <div className="shrink-0">
              <div className="mb-1.5 flex items-baseline justify-between">
                <SectionLabel>Results</SectionLabel>
              </div>
              <div className="grid gap-2">
                {visibleMetrics.map((metric) => (
                  <MetricCard
                    key={metric.key}
                    label={metric.label}
                    value={metric.value}
                    unit={metric.unit}
                    hint={metric.hint}
                    icon={metric.icon}
                    accent={metric.accent}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
