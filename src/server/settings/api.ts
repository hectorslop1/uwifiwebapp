import "server-only";

import {
  uwifiServerConfig,
  uwifiSupabaseEndpoints,
} from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type { SettingsProfile, SettingsProfileRow } from "./types";

function getSupabaseHeaders(accessToken?: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: accessToken
      ? `Bearer ${accessToken}`
      : `Bearer ${uwifiServerConfig.supabaseAnonKey}`,
    "Content-Type": "application/json",
  };
}

function mapProfile(row: SettingsProfileRow): SettingsProfile {
  return {
    customerId: row.customer_id,
    firstName: row.first_name?.trim() ?? "",
    lastName: row.last_name?.trim() ?? "",
    email: row.email?.trim() ?? "",
    phone: row.mobile_phone?.trim() ?? "",
  };
}

export async function getSettingsProfile(
  customerId: number,
  accessToken: string,
): Promise<SettingsProfile> {
  const params = new URLSearchParams({
    customer_id: `eq.${customerId}`,
    select: "customer_id,first_name,last_name,email,mobile_phone",
    limit: "1",
  });

  const rows = await fetchJson<SettingsProfileRow[]>(
    `${uwifiSupabaseEndpoints.rest}/customer?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "Unable to load your profile settings right now.",
    },
  );

  const profile = rows[0];

  if (!profile) {
    throw new Error("We could not find your customer profile.");
  }

  return mapProfile(profile);
}

export async function updateSettingsProfile(
  customerId: number,
  accessToken: string,
  input: {
    firstName: string;
    lastName: string;
    phone: string;
  },
) {
  const params = new URLSearchParams({
    customer_id: `eq.${customerId}`,
    select: "customer_id,first_name,last_name,email,mobile_phone",
  });

  const rows = await fetchJson<SettingsProfileRow[]>(
    `${uwifiSupabaseEndpoints.rest}/customer?${params.toString()}`,
    {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(accessToken),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        mobile_phone: input.phone || null,
      }),
      errorMessage: "Unable to save your profile settings right now.",
    },
  );

  const updatedProfile = rows[0];

  if (!updatedProfile) {
    throw new Error("Your profile could not be updated.");
  }

  return mapProfile(updatedProfile);
}

export async function updatePortalPassword(
  accessToken: string,
  password: string,
) {
  await fetchJson<{ id?: string }>(`${uwifiSupabaseEndpoints.auth}/user`, {
    method: "PUT",
    headers: getSupabaseHeaders(accessToken),
    body: JSON.stringify({ password }),
    errorMessage: "Unable to update your password right now.",
  });
}
