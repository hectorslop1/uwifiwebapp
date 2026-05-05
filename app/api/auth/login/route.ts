import { NextResponse } from "next/server";

import {
  createAuthSession,
  getPortalUserFromAccessToken,
  signInWithPassword,
} from "@/src/server/auth/api";
import {
  setAuthSession,
  shouldUseSecureCookies,
} from "@/src/server/auth/cookies";

type LoginPayload = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const rememberMe = body.rememberMe === true;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Ingresa tu correo y tu contraseña." },
        { status: 400 },
      );
    }

    const authResponse = await signInWithPassword(email, password);
    const portalUser = await getPortalUserFromAccessToken(
      authResponse.access_token,
    );
    const session = createAuthSession(authResponse, rememberMe);
    const response = NextResponse.json({ user: portalUser });
    const protocol = request.headers.get("x-forwarded-proto");

    setAuthSession(response.cookies, session, {
      secure: shouldUseSecureCookies(protocol),
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible iniciar sesión.";

    return NextResponse.json({ message }, { status: 401 });
  }
}
