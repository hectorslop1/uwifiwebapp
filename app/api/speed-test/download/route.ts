export const dynamic = "force-dynamic";

const defaultBytes = 5_000_000;
const maxBytes = 12_000_000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedBytes = Number(searchParams.get("bytes") ?? defaultBytes);
  const bytes = Number.isFinite(requestedBytes)
    ? Math.min(Math.max(Math.floor(requestedBytes), 250_000), maxBytes)
    : defaultBytes;

  const payload = new Uint8Array(bytes);

  return new Response(payload, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bytes),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
