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

const PING_SAMPLES = 12;
const STABILITY_SAMPLES = 8;
const DOWNLOAD_TARGET_MS = 5_000;
const UPLOAD_TARGET_MS = 4_000;
const DOWNLOAD_CHUNK_BYTES = 12_000_000;
const UPLOAD_CHUNK_BYTES = 2_000_000;
const SAMPLE_INTERVAL_MS = 140;

function uniqueQuery() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** One latency probe. Returns the round-trip in ms, or null on failure. */
async function pingOnce(): Promise<number | null> {
  const startedAt = performance.now();

  try {
    const response = await fetch(`/api/speed-test/ping?t=${uniqueQuery()}`, {
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
  let totalBytes = 0;
  let bytesSinceSample = 0;
  let lastSampleAt = phaseStart;

  while (performance.now() - phaseStart < DOWNLOAD_TARGET_MS) {
    const response = await fetch(
      `/api/speed-test/download?bytes=${DOWNLOAD_CHUNK_BYTES}&t=${uniqueQuery()}`,
      { cache: "no-store" },
    );

    const reader = response.body?.getReader();

    if (!reader) {
      const buffer = await response.arrayBuffer();
      totalBytes += buffer.byteLength;
      bytesSinceSample += buffer.byteLength;
    } else {
      let streaming = true;
      while (streaming) {
        const { done, value } = await reader.read();
        if (done || !value) {
          streaming = false;
          break;
        }

        totalBytes += value.byteLength;
        bytesSinceSample += value.byteLength;

        const now = performance.now();
        const windowMs = now - lastSampleAt;
        if (windowMs >= SAMPLE_INTERVAL_MS) {
          const mbps = (bytesSinceSample * 8) / (windowMs / 1000) / 1_000_000;
          samples.push({
            elapsed: (now - testStart) / 1000,
            mbps,
            phase: "download",
          });
          onTick(mbps, samples);
          lastSampleAt = now;
          bytesSinceSample = 0;
        }

        if (now - phaseStart >= DOWNLOAD_TARGET_MS) {
          await reader.cancel().catch(() => undefined);
          streaming = false;
        }
      }
    }
  }

  const elapsedSeconds = (performance.now() - phaseStart) / 1000;
  const mbps =
    elapsedSeconds > 0 ? (totalBytes * 8) / elapsedSeconds / 1_000_000 : 0;

  return { mbps, samples };
}

async function measureUpload(
  testStart: number,
  onTick: (liveMbps: number, samples: SpeedSample[]) => void,
): Promise<{ mbps: number; samples: SpeedSample[] }> {
  const samples: SpeedSample[] = [];
  const payload = new Blob([new Uint8Array(UPLOAD_CHUNK_BYTES)]);
  const phaseStart = performance.now();
  let totalBytes = 0;

  while (performance.now() - phaseStart < UPLOAD_TARGET_MS) {
    const chunkStart = performance.now();
    const response = await fetch(`/api/speed-test/upload?t=${uniqueQuery()}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: payload,
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as { bytesReceived?: number };
    const sentBytes = data.bytesReceived ?? UPLOAD_CHUNK_BYTES;
    const chunkSeconds = (performance.now() - chunkStart) / 1000;

    totalBytes += sentBytes;

    const mbps =
      chunkSeconds > 0 ? (sentBytes * 8) / chunkSeconds / 1_000_000 : 0;
    samples.push({
      elapsed: (performance.now() - testStart) / 1000,
      mbps,
      phase: "upload",
    });
    onTick(mbps, samples);
  }

  const elapsedSeconds = (performance.now() - phaseStart) / 1000;
  const mbps =
    elapsedSeconds > 0 ? (totalBytes * 8) / elapsedSeconds / 1_000_000 : 0;

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

  return results;
}

// --- Activity readiness ------------------------------------------------------

export type ActivityId = "browsing" | "conferencing" | "gaming" | "streaming";

export type ActivityTone = "success" | "brand" | "warning";

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
  return "warning";
}

/**
 * Maps a completed test to a readiness rating per everyday activity.
 * Every score is derived from the measured numbers against well-known
 * bandwidth / latency thresholds.
 */
export function rateActivities(results: SpeedTestResults): ActivityRating[] {
  const { downloadMbps, uploadMbps, pingMs, jitterMs, packetLossPct } = results;

  // Web browsing -- almost entirely download bound.
  const browsingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 8 && pingMs <= 90
      ? 4
      : downloadMbps >= 4
        ? 3
        : downloadMbps >= 1.5
          ? 2
          : 1;
  const browsingVerdict = ["Limited", "Usable", "Smooth", "Instant"][
    browsingScore - 1
  ];

  // Video conferencing -- needs symmetric throughput and low jitter.
  const conferencingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 6 &&
    uploadMbps >= 3 &&
    pingMs <= 90 &&
    jitterMs <= 25 &&
    packetLossPct <= 1
      ? 4
      : downloadMbps >= 3 && uploadMbps >= 1.5 && pingMs <= 150 && jitterMs <= 45
        ? 3
        : downloadMbps >= 1.5 && uploadMbps >= 0.8
          ? 2
          : 1;
  const conferencingVerdict = [
    "Unstable",
    "Audio-first",
    "Reliable",
    "Crystal clear",
  ][conferencingScore - 1];

  // Online gaming -- latency, jitter and loss dominate.
  const gamingScore: 1 | 2 | 3 | 4 =
    pingMs <= 40 && jitterMs <= 12 && packetLossPct <= 0.5
      ? 4
      : pingMs <= 80 && jitterMs <= 25 && packetLossPct <= 1.5
        ? 3
        : pingMs <= 150 && packetLossPct <= 4
          ? 2
          : 1;
  const gamingVerdict = ["Laggy", "Casual", "Responsive", "Competitive"][
    gamingScore - 1
  ];

  // Video streaming -- download bandwidth defines the resolution ceiling.
  const streamingScore: 1 | 2 | 3 | 4 =
    downloadMbps >= 25
      ? 4
      : downloadMbps >= 12
        ? 3
        : downloadMbps >= 4
          ? 2
          : 1;
  const streamingVerdict = ["SD only", "HD ready", "Full HD", "4K ready"][
    streamingScore - 1
  ];

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
      label: "Video streaming",
      verdict: streamingVerdict,
      detail: "Highest resolution your speed can sustain.",
      score: streamingScore,
      tone: toneForScore(streamingScore),
    },
  ];
}
