import {
  uwifiServerConfig,
  uwifiSupabaseEndpoints,
} from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type {
  CustomerRow,
  PortalUser,
  SupabaseAuthUser,
  SupabaseSessionResponse,
} from "./types";

const PORTAL_ALLOWED_CATEGORY_IDS = new Set([3, 4]);

function buildFullName(
  firstName: string | null,
  lastName: string | null,
  fallbackEmail: string,
) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || fallbackEmail;
}

function getSupabaseHeaders(accessToken?: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: accessToken
      ? `Bearer ${accessToken}`
      : `Bearer ${uwifiServerConfig.supabaseAnonKey}`,
    "Content-Type": "application/json",
  };
}

async function getCustomerByAuthId(
  authId: string,
  accessToken: string,
): Promise<CustomerRow> {
  const params = new URLSearchParams({
    auth_id: `eq.${authId}`,
    select:
      "customer_id,customer_afiliate_id,shared_link_id,customer_category_fk,first_name,last_name,email",
    limit: "1",
  });

  const rows = await fetchJson<CustomerRow[]>(
    `${uwifiSupabaseEndpoints.rest}/customer?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "No fue posible obtener los datos del cliente.",
    },
  );

  const customer = rows[0];

  if (!customer) {
    throw new Error(
      "No encontramos una cuenta de cliente asociada a estas credenciales.",
    );
  }

  if (
    customer.customer_category_fk !== null &&
    !PORTAL_ALLOWED_CATEGORY_IDS.has(customer.customer_category_fk)
  ) {
    throw new Error(
      "Tu cuenta no tiene acceso a este portal web. Si lo necesitas, contacta a soporte.",
    );
  }

  return customer;
}

export function createAuthSession(
  response: SupabaseSessionResponse,
  remember: boolean,
) {
  const expiresAt =
    response.expires_at ??
    Math.floor(Date.now() / 1000) + Math.max(response.expires_in, 0);

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt,
    remember,
  };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SupabaseSessionResponse> {
  return fetchJson<SupabaseSessionResponse>(
    `${uwifiSupabaseEndpoints.auth}/token?grant_type=password`,
    {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ email, password }),
      errorMessage: "No fue posible iniciar sesión.",
    },
  );
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<SupabaseSessionResponse> {
  return fetchJson<SupabaseSessionResponse>(
    `${uwifiSupabaseEndpoints.auth}/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
      errorMessage: "No fue posible refrescar la sesión.",
    },
  );
}

export async function getSupabaseUser(
  accessToken: string,
): Promise<SupabaseAuthUser> {
  return fetchJson<SupabaseAuthUser>(`${uwifiSupabaseEndpoints.auth}/user`, {
    headers: getSupabaseHeaders(accessToken),
    errorMessage: "No fue posible validar la sesión actual.",
  });
}

export async function getPortalUserFromAccessToken(
  accessToken: string,
): Promise<PortalUser> {
  const authUser = await getSupabaseUser(accessToken);
  const customer = await getCustomerByAuthId(authUser.id, accessToken);

  return {
    authId: authUser.id,
    email: authUser.email,
    firstName: customer.first_name,
    lastName: customer.last_name,
    fullName: buildFullName(
      customer.first_name,
      customer.last_name,
      customer.email || authUser.email,
    ),
    customerId: customer.customer_id,
    customerAffiliateId: customer.customer_afiliate_id,
    sharedLinkId: customer.shared_link_id,
    customerCategoryId: customer.customer_category_fk,
  };
}

export async function requestPasswordReset(email: string) {
  await fetchJson<{ success?: boolean }>(uwifiServerConfig.passwordResetWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    errorMessage: "No fue posible enviar el correo de recuperación.",
  });
}
