import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/src/server/auth/api";

type ResetPayload = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPayload;
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json(
        { message: "Please enter your email to reset your password." },
        { status: 400 },
      );
    }

    await requestPasswordReset(email);

    return NextResponse.json({
      message:
        "If the account exists, we will send you instructions to reset your password.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible enviar el correo de recuperación.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
