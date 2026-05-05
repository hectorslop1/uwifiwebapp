"use client";

import { useState } from "react";
import { Activity, Download, Gauge, RotateCcw, Upload } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";

type SpeedTestStage = "idle" | "ping" | "download" | "upload" | "done" | "error";

type SpeedTestResults = {
  pingMs: number;
  downloadMbps: number;
  uploadMbps: number;
};

const initialResults: SpeedTestResults = {
  pingMs: 0,
  downloadMbps: 0,
  uploadMbps: 0,
};

function formatMbps(value: number) {
  return value.toFixed(value >= 100 ? 0 : 1);
}

function ResultTile({
  label,
  value,
  unit,
  icon: Icon,
  accentClassName,
}: Readonly<{
  label: string;
  value: string;
  unit: string;
  icon: typeof Activity;
  accentClassName: string;
}>) {
  return (
    <SurfacePanel subtle className="p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[0.95rem] ${accentClassName}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="text-title-md text-ink">{label}</div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <div className="text-[2.25rem] font-medium tracking-[-0.08em] text-ink">
          {value}
        </div>
        <div className="pb-1 text-body-sm text-ink-muted">{unit}</div>
      </div>
    </SurfacePanel>
  );
}

function ProgressMeter({
  label,
  value,
  max,
  tone,
}: Readonly<{
  label: string;
  value: number;
  max: number;
  tone: "green" | "violet" | "amber";
}>) {
  const ratio = Math.min(value / max, 1);
  const trackClassName =
    tone === "green"
      ? "from-[#66d45f] to-[#43bf47]"
      : tone === "violet"
        ? "from-[#7b59ff] to-[#5b7bff]"
        : "from-[#f5b14b] to-[#d48319]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-body-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="text-ink-muted">{Math.round(ratio * 100)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[rgba(232,236,240,0.9)]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${trackClassName} transition-[width] duration-500`}
          style={{ width: `${Math.max(ratio * 100, value > 0 ? 8 : 0)}%` }}
        />
      </div>
    </div>
  );
}

async function measurePing() {
  const attempts = 3;
  let total = 0;

  for (let index = 0; index < attempts; index += 1) {
    const startedAt = performance.now();
    await fetch(`/api/speed-test/ping?attempt=${index}&t=${Date.now()}`, {
      cache: "no-store",
    });
    total += performance.now() - startedAt;
  }

  return total / attempts;
}

async function measureDownload(bytes: number) {
  const startedAt = performance.now();
  const response = await fetch(`/api/speed-test/download?bytes=${bytes}&t=${Date.now()}`, {
    cache: "no-store",
  });
  const buffer = await response.arrayBuffer();
  const durationMs = performance.now() - startedAt;

  return {
    bytes: buffer.byteLength,
    mbps: (buffer.byteLength * 8) / (durationMs / 1000) / 1_000_000,
  };
}

async function measureUpload(bytes: number) {
  const payload = new Blob([new Uint8Array(bytes)]);
  const startedAt = performance.now();
  const response = await fetch(`/api/speed-test/upload?t=${Date.now()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: payload,
  });
  const data = (await response.json()) as { bytesReceived?: number };
  const durationMs = performance.now() - startedAt;
  const uploadedBytes = data.bytesReceived ?? bytes;

  return {
    bytes: uploadedBytes,
    mbps: (uploadedBytes * 8) / (durationMs / 1000) / 1_000_000,
  };
}

export function SpeedTestShell() {
  const [stage, setStage] = useState<SpeedTestStage>("idle");
  const [results, setResults] = useState<SpeedTestResults>(initialResults);
  const [errorMessage, setErrorMessage] = useState("");

  const isRunning = stage === "ping" || stage === "download" || stage === "upload";

  const runSpeedTest = async () => {
    setErrorMessage("");
    setResults(initialResults);

    try {
      setStage("ping");
      const pingMs = await measurePing();

      setResults((current) => ({ ...current, pingMs }));
      setStage("download");
      const download = await measureDownload(6_000_000);

      setResults((current) => ({
        ...current,
        pingMs,
        downloadMbps: download.mbps,
      }));
      setStage("upload");
      const upload = await measureUpload(2_500_000);

      setResults({
        pingMs,
        downloadMbps: download.mbps,
        uploadMbps: upload.mbps,
      });
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

  const stageLabel =
    stage === "ping"
      ? "Measuring ping..."
      : stage === "download"
        ? "Measuring download speed..."
        : stage === "upload"
          ? "Measuring upload speed..."
          : stage === "done"
            ? "Test completed"
            : stage === "error"
              ? "Speed test stopped"
              : "Ready to run";

  return (
    <div className="space-y-5 pb-2 lg:flex lg:min-h-0 lg:flex-col lg:pb-4">
      <PageIntro
        eyebrow="Gateway"
        title="Speed test"
        description="Run a quick connection check for ping, download and upload from inside the portal."
        actions={
          <button
            type="button"
            onClick={runSpeedTest}
            disabled={isRunning}
            className="theme-control-button inline-flex items-center rounded-pill border px-4 py-2.5 text-body-sm transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRunning ? "Running..." : "Run speed test"}
          </button>
        }
      />

      {stage === "error" && errorMessage ? (
        <div className="rounded-[1.25rem] border border-[#f0d4cf] bg-[rgba(252,244,241,0.92)] px-4 py-3 text-body-sm text-[#c86c58]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_18rem]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ResultTile
              label="Ping"
              value={results.pingMs ? results.pingMs.toFixed(0) : "--"}
              unit="ms"
              icon={Gauge}
              accentClassName="bg-[rgba(245,177,75,0.16)] text-[#d48319]"
            />
            <ResultTile
              label="Download"
              value={results.downloadMbps ? formatMbps(results.downloadMbps) : "--"}
              unit="Mbps"
              icon={Download}
              accentClassName="bg-[rgba(102,212,95,0.16)] text-[#43bf47]"
            />
            <ResultTile
              label="Upload"
              value={results.uploadMbps ? formatMbps(results.uploadMbps) : "--"}
              unit="Mbps"
              icon={Upload}
              accentClassName="bg-[rgba(123,89,255,0.14)] text-[#6c45ff]"
            />
          </div>

          <SurfacePanel className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#f4faf3] text-success">
                <Activity size={18} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-title-md text-ink">Test progress</div>
                <div className="text-body-sm text-ink-muted">{stageLabel}</div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <ProgressMeter
                label="Ping"
                value={results.pingMs ? 120 - Math.min(results.pingMs, 120) : 0}
                max={120}
                tone="amber"
              />
              <ProgressMeter
                label="Download"
                value={results.downloadMbps}
                max={250}
                tone="green"
              />
              <ProgressMeter
                label="Upload"
                value={results.uploadMbps}
                max={150}
                tone="violet"
              />
            </div>
          </SurfacePanel>
        </div>

        <SurfacePanel subtle className="p-4">
          <div className="text-title-md text-ink">What this checks</div>
          <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
            <div>Ping measures how quickly a request returns.</div>
            <div>Download shows how fast data can reach this device.</div>
            <div>Upload shows how fast this device can send data back.</div>
          </div>

          <button
            type="button"
            onClick={runSpeedTest}
            disabled={isRunning}
            className="theme-cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-body-sm text-ink shadow-[0_14px_30px_rgba(201,204,214,0.14)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RotateCcw size={15} strokeWidth={1.8} />
            {isRunning ? "Testing..." : "Run again"}
          </button>
        </SurfacePanel>
      </div>
    </div>
  );
}
