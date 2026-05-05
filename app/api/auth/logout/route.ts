import { NextResponse } from "next/server";

import { clearAuthSession } from "@/src/server/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthSession(response.cookies);

  return response;
}
