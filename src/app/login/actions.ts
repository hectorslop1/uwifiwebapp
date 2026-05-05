"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import {
  createAuthSession,
  getPortalUserFromAccessToken,
  signInWithPassword,
} from "@/src/server/auth/api";
import {
  setAuthSession,
  shouldUseSecureCookies,
} from "@/src/server/auth/cookies";

export type LoginActionState = {
  message: string;
} | null;

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rememberMe = String(formData.get("rememberMe") ?? "") === "true";
  const nextPath = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return {
      message: "Ingresa tu correo y tu contraseña.",
    };
  }

  try {
    const authResponse = await signInWithPassword(email, password);
    await getPortalUserFromAccessToken(authResponse.access_token);

    const cookieStore = await cookies();
    const requestHeaders = await headers();
    const session = createAuthSession(authResponse, rememberMe);
    const protocol = requestHeaders.get("x-forwarded-proto");
    setAuthSession(cookieStore, session, {
      secure: shouldUseSecureCookies(protocol),
    });

    redirect(nextPath.startsWith("/") ? nextPath : "/overview");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      message:
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión.",
    };
  }
}
