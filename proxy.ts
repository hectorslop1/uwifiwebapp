import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  createAuthSession,
  refreshAccessToken,
} from "@/src/server/auth/api";
import {
  isSessionExpired,
  readAuthSession,
  setAuthSession,
  shouldUseSecureCookies,
} from "@/src/server/auth/cookies";

const LOGIN_PATH = "/login";
const DEFAULT_AUTHENTICATED_PATH = "/overview";

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (request.nextUrl.pathname !== LOGIN_PATH) {
    loginUrl.searchParams.set("next", currentPath);
  }

  return loginUrl;
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/overview" ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/gateway") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/settings")
  );
}

async function refreshSessionIfNeeded(request: NextRequest) {
  const session = readAuthSession(request.cookies);

  if (!session) {
    return null;
  }

  if (!isSessionExpired(session)) {
    return { session, refreshed: false };
  }

  try {
    const refreshResponse = await refreshAccessToken(session.refreshToken);
    return {
      session: createAuthSession(refreshResponse, session.remember),
      refreshed: true,
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshed = await refreshSessionIfNeeded(request);
  const isAuthenticated = Boolean(refreshed?.session);
  const loginRedirectUrl = buildLoginRedirect(request);

  if (pathname === LOGIN_PATH && isAuthenticated) {
    const response = NextResponse.redirect(
      new URL(DEFAULT_AUTHENTICATED_PATH, request.url),
    );

    if (refreshed?.refreshed) {
      setAuthSession(response.cookies, refreshed.session, {
        secure: shouldUseSecureCookies(
          request.nextUrl.protocol.replace(":", ""),
        ),
      });
    }

    return response;
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    return NextResponse.redirect(loginRedirectUrl);
  }

  if (refreshed?.refreshed) {
    const response = NextResponse.next();
    setAuthSession(response.cookies, refreshed.session, {
      secure: shouldUseSecureCookies(
        request.nextUrl.protocol.replace(":", ""),
      ),
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/overview/:path*",
    "/billing/:path*",
    "/gateway/:path*",
    "/wallet/:path*",
    "/store/:path*",
    "/settings/:path*",
  ],
};
