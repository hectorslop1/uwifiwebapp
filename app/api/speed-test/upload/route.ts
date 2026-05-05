export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.arrayBuffer();

  return Response.json(
    {
      ok: true,
      bytesReceived: body.byteLength,
      now: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
