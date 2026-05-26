"use client";

import { useState, useEffect } from "react";
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
  Play,
  RotateCcw,
  Server,
  Signal,
  Upload,
  Video,
  Waves,
  Wifi,
  Headphones,
  Laptop,
  Tv,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { cn } from "@/src/lib/cn";

import {
  rateActivities,
  runSpeedTest,
  SPEED_TEST_SERVER_URL,
  type ActivityId,
  type ActivityRating,
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
  streaming: Tv,
  music: Headphones,
  work: Laptop,
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
  icon: Icon,
  accent,
  compact = false,
}: Readonly<{
  label: string;
  value: string;
  unit: string;
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

  // Brand-exact glow: green #69c45f → rgb(105,196,95), purple #682cd0 → rgb(104,44,208)
  const glowClass =
    accent === "green"
      ? "bg-[radial-gradient(circle_at_top,rgba(105,196,95,0.12),transparent_70%)]"
      : accent === "violet"
        ? "bg-[radial-gradient(circle_at_top,rgba(104,44,208,0.10),transparent_70%)]"
        : "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_70%)]";

  return (
    <SurfacePanel
      subtle
      className="relative overflow-hidden p-3"
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
        <div className="mt-2 flex items-baseline gap-1">
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
      </div>
    </SurfacePanel>
  );
}



const PENDING_ACTIVITIES: ReadonlyArray<{
  id: ActivityId;
  label: string;
  detail: string;
}> = [
  { id: "browsing", label: "Web browsing", detail: "Pages, search and email load without waiting." },
  { id: "conferencing", label: "Video conferencing", detail: "Group video calls stay sharp and in sync." },
  { id: "gaming", label: "Online gaming", detail: "Low, steady latency for real-time play." },
  { id: "streaming", label: "4K Streaming", detail: "Highest resolution streaming without buffering." },
  { id: "music", label: "Music streaming", detail: "Lag-free audio streaming in high quality." },
  { id: "work", label: "Smart work", detail: "Reliable file transfers, VPNs and telecommuting." },
];

function PendingActivityRow({ activity }: Readonly<{ activity: { id: ActivityId; label: string; detail: string } }>) {
  const Icon = ACTIVITY_ICONS[activity.id];
  return (
    <div className="flex items-center gap-3 py-[0.5rem] opacity-55 transition-all duration-300">
      <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[0.7rem] border border-line bg-white/70 text-ink-faint transition-all duration-300">
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] font-medium text-ink-muted">
          {activity.label}
        </span>
        <span className="block text-[0.66rem] text-ink-faint mt-0.5 truncate">
          {activity.detail}
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 rounded-pill border border-line bg-white/70 px-2.5 py-1 text-[0.7rem] font-semibold text-ink-faint transition-all duration-300">
        Pending
      </span>
    </div>
  );
}

function ActivityRow({ rating }: Readonly<{ rating: ActivityRating }>) {
  const Icon = ACTIVITY_ICONS[rating.id];
  
  // U-wifi brand-only tier styling. Green = excellent, purple = good, neutral = limited.
  // Off-brand cyan/emerald/amber removed; red reserved for true error states elsewhere.
  const config = (() => {
    if (rating.score >= 4) {
      return {
        // Excellent: brand green #69c45f with darker text for contrast on tinted bg
        iconClass: "text-[#3f8a36] bg-[rgba(105,196,95,0.12)] border-[rgba(105,196,95,0.20)]",
        pillClass: "text-[#3f8a36] bg-[rgba(105,196,95,0.12)] border-[rgba(105,196,95,0.18)]",
        verdictText: "Excellent",
        verdictIcon: Check,
      };
    } else if (rating.score === 3) {
      return {
        // Good: brand purple #682cd0
        iconClass: "text-[#682cd0] bg-[rgba(104,44,208,0.10)] border-[rgba(104,44,208,0.20)]",
        pillClass: "text-[#682cd0] bg-[rgba(104,44,208,0.10)] border-[rgba(104,44,208,0.18)]",
        verdictText: "Good",
        verdictIcon: Check,
      };
    } else {
      // Limited / unsupported: neutral, no off-brand accent
      return {
        iconClass: "text-ink-soft bg-[rgba(15,23,42,0.04)] border-[rgba(15,23,42,0.06)]",
        pillClass: "text-ink-soft bg-[rgba(15,23,42,0.04)] border-[rgba(15,23,42,0.06)]",
        verdictText: rating.verdict, // dynamic verdict from runner: "Laggy", "SD only", etc.
        verdictIcon: Check,
      };
    }
  })();

  const VerdictIcon = config.verdictIcon;

  return (
    <div className="flex items-center gap-3 py-[0.5rem] transition-all duration-300">
      <span
        className={cn(
          "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[0.7rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300",
          config.iconClass,
        )}
      >
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] font-semibold leading-tight text-ink">
          {rating.label}
        </span>
        <span className="block text-[0.66rem] text-ink-muted mt-0.5 truncate">
          {rating.detail}
        </span>
      </div>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[0.7rem] font-semibold transition-all duration-300",
          config.pillClass,
        )}
      >
        <VerdictIcon size={11} strokeWidth={2.8} />
        {config.verdictText}
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
  // The chart now renders the live test trace only; history state is kept so
  // the existing fetch sites continue to populate the server with post-test
  // telemetry without altering API contracts. Reading is no longer needed.
  const [, setHistory] = useState<ReadonlyArray<{ download_speed: number; upload_speed: number; created_at?: string }>>([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${SPEED_TEST_SERVER_URL}/api/results`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  useEffect(() => {
    fetch(`${SPEED_TEST_SERVER_URL}/api/results`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("fail");
      })
      .then((data) => setHistory(data))
      .catch((err) => console.error("History load error:", err));
  }, []);

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
      await fetchHistory();
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
  const dialStatus: "idle" | "live" | "measured" = isRunning
    ? "live"
    : stage === "done"
      ? "measured"
      : "idle";

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
          subCaption: undefined,
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
    icon: LucideIcon;
    accent: "green" | "violet" | "neutral";
    technicalOnly?: boolean;
  }> = [
    {
      key: "download",
      label: "Download",
      value: formatMbps(results?.downloadMbps),
      unit: "Mbps",
      icon: Download,
      accent: "green",
    },
    {
      key: "upload",
      label: "Upload",
      value: formatMbps(results?.uploadMbps),
      unit: "Mbps",
      icon: Upload,
      accent: "violet",
    },
    {
      key: "ping",
      label: "Ping",
      value: formatMs(results?.pingMs),
      unit: "ms",
      icon: Gauge,
      accent: "neutral",
    },
    {
      key: "jitter",
      label: "Jitter",
      value: formatMs(results?.jitterMs),
      unit: "ms",
      icon: Activity,
      accent: "neutral",
      technicalOnly: true,
    },
    {
      key: "loss",
      label: "Packet loss",
      value: formatLossPct(results?.packetLossPct),
      unit: "%",
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
          <SurfacePanel
            className={cn(
              "flex flex-col p-3.5 lg:min-h-0 lg:overflow-hidden",
              !isTechnical && "lg:flex-1",
            )}
          >
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
                    mode="technical"
                    status={dialStatus}
                    frameClassName="relative mx-auto aspect-square w-full max-w-[12rem] sm:max-w-[13.5rem] lg:h-full lg:max-h-[14rem] lg:w-auto lg:max-w-full"
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
                    mode="simple"
                    status={dialStatus}
                    frameClassName="relative mx-auto aspect-square w-full max-w-[17.5rem] sm:max-w-[19rem] lg:h-full lg:max-h-[24rem] lg:w-auto lg:max-w-full"
                  />
                </div>

                <div className="flex shrink-0 flex-col justify-center gap-2.5 sm:w-[16.5rem] sm:border-l sm:border-line/10 sm:pl-4">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={isRunning}
                    className="theme-cta inline-flex w-full items-center justify-center gap-1.5 rounded-[1rem] border px-5 py-3 text-[0.88rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {stage === "done" || stage === "error" ? (
                      <RotateCcw size={15} strokeWidth={2} />
                    ) : (
                      <Play size={15} strokeWidth={2} />
                    )}
                    {startLabel}
                  </button>
                  <div className="flex flex-col gap-1.5">
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
                    icon={metric.icon}
                    accent={metric.accent}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {isTechnical ? (
            <SurfacePanel subtle className="shrink-0 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <SectionLabel>Connection trace</SectionLabel>
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-[#3f8a36]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#69c45f]" />
                    Download
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-[#5421a8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#682cd0]" />
                    Upload
                  </span>
                </span>
              </div>
              <SpeedChart
                samples={progress?.samples ?? results?.samples ?? []}
                state={
                  isRunning
                    ? "running"
                    : stage === "done"
                      ? "completed"
                      : "idle"
                }
                heightClass="h-[10.5rem]"
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
              <div className="flex min-h-0 flex-1 flex-col justify-center divide-y divide-line/12">
                {PENDING_ACTIVITIES.map((activity) => (
                  <PendingActivityRow key={activity.id} activity={activity} />
                ))}
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
