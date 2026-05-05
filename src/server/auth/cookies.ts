import type { AuthSession } from "./types";

export const AUTH_COOKIE_NAMES = {
  accessToken: "uwifi-access-token",
  refreshToken: "uwifi-refresh-token",
  expiresAt: "uwifi-expires-at",
  remember: "uwifi-remember",
} as const;

type CookieBag = {
  get(name: string): { value: string } | undefined;
};

type MutableCookieBag = CookieBag & {
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
      path?: string;
      maxAge?: number;
    },
  ): unknown;
  delete(name: string): unknown;
};

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

type CookieOptionsOverrides = {
  secure?: boolean;
};

function getCookieOptions(
  remember: boolean,
  overrides: CookieOptionsOverrides = {},
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: overrides.secure ?? process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
  };
}

export function shouldUseSecureCookies(protocol?: string | null) {
  return protocol === "https";
}

export function readAuthSession(cookieStore: CookieBag): AuthSession | null {
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
  const expiresAtValue = cookieStore.get(AUTH_COOKIE_NAMES.expiresAt)?.value;

  if (!accessToken || !refreshToken || !expiresAtValue) {
    return null;
  }

  const expiresAt = Number(expiresAtValue);

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    remember: cookieStore.get(AUTH_COOKIE_NAMES.remember)?.value === "1",
  };
}

export function setAuthSession(
  cookieStore: MutableCookieBag,
  session: AuthSession,
  overrides: CookieOptionsOverrides = {},
) {
  const options = getCookieOptions(session.remember, overrides);

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, session.accessToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, session.refreshToken, options);
  cookieStore.set(
    AUTH_COOKIE_NAMES.expiresAt,
    String(session.expiresAt),
    options,
  );
  cookieStore.set(
    AUTH_COOKIE_NAMES.remember,
    session.remember ? "1" : "0",
    {
      ...options,
      httpOnly: false,
    },
  );
}

export function clearAuthSession(cookieStore: MutableCookieBag) {
  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.expiresAt);
  cookieStore.delete(AUTH_COOKIE_NAMES.remember);
}

export function isSessionExpired(session: AuthSession, skewInSeconds = 30) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return session.expiresAt <= nowInSeconds + skewInSeconds;
}
