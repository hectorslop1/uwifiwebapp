import "server-only";

import { cookies } from "next/headers";

import { getPortalUserFromAccessToken, refreshAccessToken } from "./api";
import type { AuthSession, PortalUser } from "./types";
import { isSessionExpired, readAuthSession } from "./cookies";

export async function getAuthSession() {
  const cookieStore = await cookies();
  return readAuthSession(cookieStore);
}

export async function getActiveAuthSession(): Promise<AuthSession | null> {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  if (!isSessionExpired(session)) {
    return session;
  }

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);

    return {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt:
        refreshed.expires_at ??
        Math.floor(Date.now() / 1000) + Math.max(refreshed.expires_in, 0),
      remember: session.remember,
    };
  } catch {
    return null;
  }
}

export type AuthenticatedPortalContext = {
  user: PortalUser;
  accessToken: string;
  session: AuthSession;
};

export async function getAuthenticatedPortalContext(): Promise<AuthenticatedPortalContext | null> {
  const session = await getActiveAuthSession();

  if (!session) {
    return null;
  }

  try {
    const user = await getPortalUserFromAccessToken(session.accessToken);

    return {
      user,
      accessToken: session.accessToken,
      session,
    };
  } catch {
    return null;
  }
}

export async function getAuthenticatedPortalUser() {
  const context = await getAuthenticatedPortalContext();
  return context?.user ?? null;
}
