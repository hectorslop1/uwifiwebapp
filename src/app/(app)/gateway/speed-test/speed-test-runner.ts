/**
 * Client-side speed-test engine.
 *
 * Runs against the portal's own `/api/speed-test/*` endpoints and produces
 * real measurements for latency, jitter, packet loss, download and upload.
 * Stability is a transparent composite derived from those measured values --
 * no figure here is invented.
 */

export type SpeedTestPhase = "latency" | "download" | "upload" | "stability";

export type SpeedTestStage = SpeedTestPhase | "idle" | "done" | "error";

export type SpeedSample = {
  /** Seconds elapsed since the test started. */
  elapsed: number;
  mbps: number;
  phase: "download" | "upload";
};

export type SpeedTestResults = {
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
  downloadMbps: number;
  uploadMbps: number;
  /** 0-100 composite, derived from ping, jitter and packet loss. */
  stabilityPct: number;
  samples: SpeedSample[];
  finishedAt: number;
};

export type SpeedTestProgress = {
  stage: SpeedTestStage;
  /** Instantaneous speed for the live gauge, while a transfer phase runs. */
  liveMbps: number;
  partial: Partial<SpeedTestResults>;
  samples: SpeedSample[];
};

type ProgressFn = (progress: SpeedTestProgress) => void;

export const SPEED_TEST_SERVER_URL =
  process.env.NEXT_PUBLIC_SPEED_TEST_SERVER_URL || "http://216.250.125.239:8081";

const PING_SAMPLES = 12;
const STABILITY_SAMPLES = 8;
const DOWNLOAD_TARGET_MS = 6_000;
const UPLOAD_TARGET_MS = 6_000;

function uniqueQuery() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** One latency probe. Returns the round-trip in ms, or null on failure. */
async function pingOnce(): Promise<number | null> {
  const startedAt = performance.now();

  try {
    const response = await fetch(`${SPEED_TEST_SERVER_URL}/ping?t=${uniqueQuery()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    await response.arrayBuffer();
    return performance.now() - startedAt;
  } catch {
    return null;
  }
}

type LatencyStats = {
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
};

function summariseLatency(samples: ReadonlyArray<number | null>): LatencyStats {
  const ok = samples.filter((value): value is number => value !== null);

  if (ok.length === 0) {
    return { pingMs: 0, jitterMs: 0, packetLossPct: 100 };
  }

  const pingMs = ok.reduce((total, value) => total + value, 0) / ok.length;

  let jitterTotal = 0;
  for (let index = 1; index < ok.length; index += 1) {
    jitterTotal += Math.abs(ok[index] - ok[index - 1]);
  }
  const jitterMs = ok.length > 1 ? jitterTotal / (ok.length - 1) : 0;

  const packetLossPct = ((samples.length - ok.length) / samples.length) * 100;

  return { pingMs, jitterMs, packetLossPct };
}

async function measureDownload(
  testStart: number,
  onTick: (liveMbps: number, samples: SpeedSample[]) => void,
): Promise<{ mbps: number; samples: SpeedSample[] }> {
  const samples: SpeedSample[] = [];
  const phaseStart = performance.now();
  const testDurationLimit = DOWNLOAD_TARGET_MS; // 6 seconds
  let totalDownloadedBytes = 0;
  let isDownloadFinished = false;
  const downloadChunkSize = 4 * 1024 * 1024; // 4MB
  const controller = new AbortController();
  const { signal } = controller;

  let lastSampleTime = phaseStart;
  const sampleInterval = 120; // ms

  const downloadWorker = async () => {
    while (performance.now() - phaseStart < testDurationLimit && !isDownloadFinished) {
      try {
        const response = await fetch(
          `${SPEED_TEST_SERVER_URL}/download?size=${downloadChunkSize}&t=${uniqueQuery()}`,
          { signal, cache: "no-store" }
        );
        if (!response.ok) continue;

        const reader = response.body?.getReader();
        if (!reader) {
          const buffer = await response.arrayBuffer();
          if (isDownloadFinished) break;
          totalDownloadedBytes += buffer.byteLength;
          const now = performance.now();
          const elapsedSec = (now - phaseStart) / 1000;
          if (elapsedSec > 0) {
            const instantSpeedMbps = (totalDownloadedBytes * 8) / (elapsedSec * 1000000);
            if (now - lastSampleTime >= sampleInterval) {
              samples.push({
                elapsed: (now - testStart) / 1000,
                mbps: instantSpeedMbps,
                phase: "download",
              });
              lastSampleTime = now;
            }
            onTick(instantSpeedMbps, samples);
          }
          continue;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done || isDownloadFinished) break;

          totalDownloadedBytes += value.length;
          
          const now = performance.now();
          const elapsedSec = (now - phaseStart) / 1000;
          if (elapsedSec > 0) {
            const instantSpeedMbps = (totalDownloadedBytes * 8) / (elapsedSec * 1000000);
            if (now - lastSampleTime >= sampleInterval) {
              samples.push({
                elapsed: (now - testStart) / 1000,
                mbps: instantSpeedMbps,
                phase: "download",
              });
              lastSampleTime = now;
            }
            onTick(instantSpeedMbps, samples);
          }

          if (performance.now() - phaseStart >= testDurationLimit) {
            isDownloadFinished = true;
            controller.abort();
            await reader.cancel().catch(() => {});
            break;
          }
        }
      } catch {
        // Silence expected abort errors
      }
    }
  };

  // Launch 3 concurrent workers in parallel to saturate the client's network
  const workers = [downloadWorker(), downloadWorker(), downloadWorker()];
  await Promise.all(workers);
  isDownloadFinished = true;
  controller.abort();

  const totalDurationSec = (performance.now() - phaseStart) / 1000;
  const mbps = totalDurationSec > 0 ? (totalDownloadedBytes * 8) / (totalDurationSec * 1000000) : 0;

  return { mbps, samples };
}

async function measureUpload(
  testStart: number,
  onTick: (liveMbps: number, samples: SpeedSample[]) => void,
): Promise<{ mbps: number; samples: SpeedSample[] }> {
  const samples: SpeedSample[] = [];
  const phaseStart = performance.now();
  const testDurationLimit = UPLOAD_TARGET_MS; // 6 seconds
  
  // Generate 1MB random buffer in memory to prevent browser/network payload compression
  const chunkSize = 1024 * 1024; // 1MB
  const randomBuffer = new Uint8Array(chunkSize);
  const maxEntropySize = 65536;
  for (let i = 0; i < chunkSize; i += maxEntropySize) {
    const end = Math.min(i + maxEntropySize, chunkSize);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(randomBuffer.subarray(i, end));
    } else {
      for (let j = i; j < end; j++) {
        randomBuffer[j] = Math.floor(Math.random() * 256);
      }
    }
  }

  const payload = new Blob([randomBuffer]);
  let totalUploadedBytes = 0;
  let isUploadFinished = false;
  const controller = new AbortController();
  const { signal } = controller;

  let lastSampleTime = phaseStart;
  const sampleInterval = 120; // ms

  const uploadWorker = async () => {
    while (performance.now() - phaseStart < testDurationLimit && !isUploadFinished) {
      try {
        if (performance.now() - phaseStart >= testDurationLimit) {
          isUploadFinished = true;
          controller.abort();
          break;
        }

        const response = await fetch(`${SPEED_TEST_SERVER_URL}/upload?t=${uniqueQuery()}`, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: payload,
          signal,
        });

        if (response.ok && !isUploadFinished) {
          totalUploadedBytes += chunkSize;
          const now = performance.now();
          const elapsedSec = (now - phaseStart) / 1000;
          if (elapsedSec > 0) {
            const instantSpeedMbps = (totalUploadedBytes * 8) / (elapsedSec * 1000000);
            if (now - lastSampleTime >= sampleInterval) {
              samples.push({
                elapsed: (now - testStart) / 1000,
                mbps: instantSpeedMbps,
                phase: "upload",
              });
              lastSampleTime = now;
            }
            onTick(instantSpeedMbps, samples);
          }
        }
      } catch {
        // Silence expected abort errors
      }
    }
  };

  // Launch 3 concurrent workers in parallel to saturate the client's network upload path
  const workers = [uploadWorker(), uploadWorker(), uploadWorker()];
  await Promise.all(workers);
  isUploadFinished = true;
  controller.abort();

  const totalDurationSec = (performance.now() - phaseStart) / 1000;
  const mbps = totalDurationSec > 0 ? (totalUploadedBytes * 8) / (totalDurationSec * 1000000) : 0;

  return { mbps, samples };
}

/**
 * Composite stability score (0-100) derived from measured ping, jitter and
 * packet loss. A clean line sits near 100; jitter and loss pull it down.
 */
export function computeStability(
  pingMs: number,
  jitterMs: number,
  packetLossPct: number,
): number {
  let score = 100;
  score -= Math.min(jitterMs * 1.4, 45);
  score -= packetLossPct * 9;
  score -= Math.max(0, pingMs - 25) * 0.18;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function runSpeedTest(
  onProgress: ProgressFn,
): Promise<SpeedTestResults> {
  const testStart = performance.now();
  const collectedSamples: SpeedSample[] = [];

  // --- Phase 1: latency, jitter, packet loss --------------------------------
  onProgress({ stage: "latency", liveMbps: 0, partial: {}, samples: [] });

  const latencyProbes: Array<number | null> = [];
  for (let index = 0; index < PING_SAMPLES; index += 1) {
    latencyProbes.push(await pingOnce());
  }

  let latency = summariseLatency(latencyProbes);
  if (latencyProbes.every((value) => value === null)) {
    throw new Error("The test server did not respond. Check your connection.");
  }

  onProgress({
    stage: "latency",
    liveMbps: 0,
    partial: latency,
    samples: [],
  });

  // --- Phase 2: download ----------------------------------------------------
  onProgress({
    stage: "download",
    liveMbps: 0,
    partial: latency,
    samples: collectedSamples,
  });

  const download = await measureDownload(testStart, (liveMbps, samples) => {
    onProgress({
      stage: "download",
      liveMbps,
      partial: latency,
      samples: [...collectedSamples, ...samples],
    });
  });
  collectedSamples.push(...download.samples);

  // --- Phase 3: upload ------------------------------------------------------
  onProgress({
    stage: "upload",
    liveMbps: 0,
    partial: { ...latency, downloadMbps: download.mbps },
    samples: collectedSamples,
  });

  const upload = await measureUpload(testStart, (liveMbps, samples) => {
    onProgress({
      stage: "upload",
      liveMbps,
      partial: { ...latency, downloadMbps: download.mbps },
      samples: [...collectedSamples, ...samples],
    });
  });
  collectedSamples.push(...upload.samples);

  // --- Phase 4: stability ---------------------------------------------------
  onProgress({
    stage: "stability",
    liveMbps: 0,
    partial: {
      ...latency,
      downloadMbps: download.mbps,
      uploadMbps: upload.mbps,
    },
    samples: collectedSamples,
  });

  const stabilityProbes: Array<number | null> = [];
  for (let index = 0; index < STABILITY_SAMPLES; index += 1) {
    stabilityProbes.push(await pingOnce());
  }

  latency = summariseLatency([...latencyProbes, ...stabilityProbes]);
  const stabilityPct = computeStability(
    latency.pingMs,
    latency.jitterMs,
    latency.packetLossPct,
  );

  const results: SpeedTestResults = {
    pingMs: latency.pingMs,
    jitterMs: latency.jitterMs,
    packetLossPct: latency.packetLossPct,
    downloadMbps: download.mbps,
    uploadMbps: upload.mbps,
    stabilityPct,
    samples: collectedSamples,
    finishedAt: Date.now(),
  };

  onProgress({
    stage: "done",
    liveMbps: download.mbps,
    partial: results,
    samples: collectedSamples,
  });

  try {
    const payload = {
      uuid: `u-wifi-web-${Date.now()}`,
      download_speed: Number(results.downloadMbps.toFixed(2)),
      upload_speed: Number(results.uploadMbps.toFixed(2)),
      ping: Number(results.pingMs.toFixed(2)),
      jitter: Number(results.jitterMs.toFixed(2)),
      device_os: "Web Browser",
      device_os_version: typeof window !== "undefined" && window.navigator ? window.navigator.userAgent.substring(0, 40) : "Unknown",
      device_model: "Web App",
      app_version: "1.0.0",
      carrier: "Web Connection",
      latitude: 0.0,
      longitude: 0.0,
    };

    await fetch(`${SPEED_TEST_SERVER_URL}/api/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Telemetry server post error:", err));
  } catch (err) {
    console.error("Telemetry payload error:", err);
  }

  return results;
}

// --- Activity readiness ------------------------------------------------------

export type ActivityId = "browsing" | "conferencing" | "gaming" | "streaming";

export type ActivityTone = "success" | "brand" | "warning" | "danger";

export type ActivityRating = {
  id: ActivityId;
  label: string;
  verdict: string;
  detail: string;
  /** Quality out of 4 meter segments. */
  score: 1 | 2 | 3 | 4;
  tone: ActivityTone;
};

function toneForScore(score: 1 | 2 | 3 | 4): ActivityTone {
  if (score >= 4) {
    return "success";
  }
  if (score === 3) {
    return "brand";
  }
  if (score === 2) {
    return "warning";
  }
  return "danger";
}

/**
 * Maps a completed test to a readiness rating per everyday activity.
 * Every score is derived from the measured numbers against well-known
 * bandwidth / latency thresholds, aligned with Flutter app rules.
 */
export function rateActivities(results: SpeedTestResults): ActivityRating[] {
  const { downloadMbps, uploadMbps, pingMs } = results;

  // 1. Browsing -- Excellent: >= 5.0, Good: >= 1.5, Fair: >= 0.5
  const browsingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 5.0 ? 4 : downloadMbps >= 1.5 ? 3 : downloadMbps >= 0.5 ? 2 : 1;
  const browsingVerdict = ["Limited", "Usable", "Smooth", "Instant"][browsingScore - 1];

  // 2. Video conferencing / calls -- Excellent: >= 10D, >= 4U, <= 60ms. Good: >= 4D, >= 1.5U, <= 120ms. Fair: >= 1.5D, >= 0.8U
  const conferencingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 10.0 && uploadMbps >= 4.0 && pingMs > 0 && pingMs <= 60.0
      ? 4
      : downloadMbps >= 4.0 && uploadMbps >= 1.5 && pingMs > 0 && pingMs <= 120.0
        ? 3
        : downloadMbps >= 1.5 && uploadMbps >= 0.8
          ? 2
          : 1;
  const conferencingVerdict = ["Unstable", "Audio-first", "Reliable", "Crystal clear"][conferencingScore - 1];

  // 3. Online gaming -- Excellent: <= 35ms, Good: <= 80ms, Fair: <= 150ms
  const gamingScore: 1 | 2 | 3 | 4 =
    pingMs > 0 && pingMs <= 35.0
      ? 4
      : pingMs > 0 && pingMs <= 80.0
        ? 3
        : pingMs > 0 && pingMs <= 150.0
          ? 2
          : 1;
  const gamingVerdict = ["Laggy", "Casual", "Responsive", "Competitive"][gamingScore - 1];

  // 4. Video / 4K streaming -- Excellent: >= 25.0, Good: >= 8.0, Fair: >= 3.0
  const streamingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 25.0 ? 4 : downloadMbps >= 8.0 ? 3 : downloadMbps >= 3.0 ? 2 : 1;
  const streamingVerdict = ["SD only", "HD ready", "Full HD", "4K ready"][streamingScore - 1];

  return [
    {
      id: "browsing",
      label: "Web browsing",
      verdict: browsingVerdict,
      detail: "Pages, search and email load without waiting.",
      score: browsingScore,
      tone: toneForScore(browsingScore),
    },
    {
      id: "conferencing",
      label: "Video conferencing",
      verdict: conferencingVerdict,
      detail: "Group video calls stay sharp and in sync.",
      score: conferencingScore,
      tone: toneForScore(conferencingScore),
    },
    {
      id: "gaming",
      label: "Online gaming",
      verdict: gamingVerdict,
      detail: "Low, steady latency for real-time play.",
      score: gamingScore,
      tone: toneForScore(gamingScore),
    },
    {
      id: "streaming",
      label: "4K Streaming",
      verdict: streamingVerdict,
      detail: "Highest resolution streaming without buffering.",
      score: streamingScore,
      tone: toneForScore(streamingScore),
    },
  ];
}
