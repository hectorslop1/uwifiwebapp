import "server-only";

import { getPaymentMethods } from "@/src/server/billing/api";
import { uwifiServerConfig, uwifiSupabaseEndpoints } from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type {
  WalletAffiliateUser,
  WalletDashboardData,
  WalletHistoryEntry,
  WalletPointsSummary,
} from "./types";

type CustomerPointsRpcResponse = Record<string, unknown> | Array<Record<string, unknown>>;

type AffiliateRpcRow = {
  customer_id?: number | null;
  customer_name?: string | null;
  is_affiliate?: boolean | null;
};

type CustomerRow = {
  customer_id?: number | null;
  customer_afiliate_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
};

type VisualizationRow = Record<string, unknown>;

function getSupabaseHeaders(accessToken: string, schema?: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...(schema ? { "Accept-Profile": schema } : {}),
  };
}

async function postRpc<T>(
  functionName: string,
  params: Record<string, unknown>,
  accessToken: string,
  errorMessage: string,
) {
  return fetchJson<T>(`${uwifiSupabaseEndpoints.rpc}/${functionName}`, {
    method: "POST",
    headers: getSupabaseHeaders(accessToken),
    body: JSON.stringify(params),
    errorMessage,
  });
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function formatInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  if (parts[0]?.length) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "UW";
}

function normalizePointsResponse(
  response: CustomerPointsRpcResponse | null,
): WalletPointsSummary {
  const record = Array.isArray(response) ? response[0] : response;

  if (!record) {
    return {
      customerId: 0,
      principalPoints: 0,
      affiliatePoints: 0,
      totalPoints: 0,
      principalDollars: 0,
      affiliateDollars: 0,
      totalDollars: 0,
      billingStart: "",
      billingEnd: "",
    };
  }

  const principalPoints =
    toNumber(record.principal_points) ||
    toNumber(record.principal_impression_points) +
      toNumber(record.principal_click_points);
  const affiliatePoints =
    toNumber(record.affiliate_points) ||
    toNumber(record.affiliate_impression_points) +
      toNumber(record.affiliate_click_points);
  const totalPoints =
    toNumber(record.total_points_earned) || toNumber(record.total_points);

  return {
    customerId: toNumber(record.customer_id),
    principalPoints,
    affiliatePoints,
    totalPoints,
    principalDollars: toNumber(record.principal_dollars),
    affiliateDollars: toNumber(record.affiliate_dollars),
    totalDollars: toNumber(record.total_dollars),
    billingStart: String(record.billing_start ?? ""),
    billingEnd: String(record.billing_end ?? ""),
  };
}

function emptyHistory(period: "weekly" | "monthly"): WalletHistoryEntry[] {
  if (period === "weekly") {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => ({
      label,
      points: 0,
    }));
  }

  return ["Week 1", "Week 2", "Week 3", "Week 4"].map((label) => ({
    label,
    points: 0,
  }));
}

async function fetchVisualizationRows(
  accessToken: string,
  {
    schema,
    createdAtColumn,
    pointsColumn,
    filterColumn,
    filterValue,
    rangeStartUtc,
    rangeEndUtc,
  }: {
    schema?: string;
    createdAtColumn: string;
    pointsColumn: string;
    filterColumn: string;
    filterValue: number;
    rangeStartUtc: string;
    rangeEndUtc: string;
  },
) {
  const params = new URLSearchParams({
    select: `${createdAtColumn},${pointsColumn}`,
    [filterColumn]: `eq.${filterValue}`,
    [createdAtColumn]: `gte.${rangeStartUtc}`,
  });
  params.append(createdAtColumn, `lt.${rangeEndUtc}`);
  params.append("order", createdAtColumn);

  return fetchJson<VisualizationRow[]>(
    `${uwifiSupabaseEndpoints.rest}/customer_media_visualization?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken, schema),
      errorMessage: "No fue posible obtener el historial de puntos.",
    },
  );
}

export async function getWalletPointsSummary(
  customerId: number,
  customerAffiliateId: number | null,
  accessToken: string,
) {
  const response = await postRpc<CustomerPointsRpcResponse | null>(
    "customer_current_point",
    {
      var_customer_id: customerId,
      var_customer_afiliate_id: customerAffiliateId ?? customerId,
    },
    accessToken,
    "No fue posible obtener los puntos del cliente.",
  );

  return normalizePointsResponse(response);
}

export async function getAffiliatedUsers(
  customerId: number,
  accessToken: string,
): Promise<WalletAffiliateUser[]> {
  try {
    const response = await postRpc<AffiliateRpcRow[] | null>(
      "get_afiliate_customers",
      { customerid: String(customerId) },
      accessToken,
      "No fue posible obtener los usuarios afiliados.",
    );

    const rows = Array.isArray(response) ? response : [];

    if (rows.length) {
      return rows.map((row) => {
        const customerName = (row.customer_name ?? "Unknown").trim() || "Unknown";
        return {
          customerId: toNumber(row.customer_id),
          customerName,
          isAffiliate: Boolean(row.is_affiliate),
          initials: formatInitials(customerName),
        };
      });
    }
  } catch {
    // fallback below
  }

  const params = new URLSearchParams({
    select: "customer_id,customer_afiliate_id,first_name,last_name",
    or: `customer_id.eq.${customerId},customer_afiliate_id.eq.${customerId}`,
    order: "customer_id.asc",
  });

  const rows = await fetchJson<CustomerRow[]>(
    `${uwifiSupabaseEndpoints.rest}/customer?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "No fue posible obtener los usuarios afiliados.",
    },
  );

  return rows.map((row) => {
    const customerName =
      `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Unknown";
    const currentCustomerId = toNumber(row.customer_id);
    return {
      customerId: currentCustomerId,
      customerName,
      isAffiliate: currentCustomerId !== customerId,
      initials: formatInitials(customerName),
    };
  });
}

export async function getWalletPointsHistory(
  customerId: number,
  customerAffiliateId: number | null,
  period: "weekly" | "monthly",
  accessToken: string,
): Promise<WalletHistoryEntry[]> {
  const affiliateId = customerAffiliateId ?? customerId;
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rangeEndLocal = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const rangeStartLocal =
    period === "weekly"
      ? new Date(rangeEndLocal.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(rangeEndLocal.getTime() - 28 * 24 * 60 * 60 * 1000);

  const rangeStartUtc = rangeStartLocal.toISOString();
  const rangeEndUtc = rangeEndLocal.toISOString();

  const schemaCandidates = ["transactions", undefined] as const;
  const createdAtCandidates = ["created_at", "created_at_timestamp"] as const;
  const pointsCandidates = ["points_earned", "points"] as const;
  const filters = [
    { column: "customer_afiliate_id", value: affiliateId },
    { column: "customer_fk", value: customerId },
  ] as const;

  let rows: VisualizationRow[] = [];
  let createdAtKey = "created_at";
  let pointsKey = "points_earned";
  let foundNonEmpty = false;
  let hadSuccessfulQuery = false;
  let bestRows: VisualizationRow[] = [];
  let bestCreatedAtKey = createdAtKey;
  let bestPointsKey = pointsKey;

  for (const schema of schemaCandidates) {
    if (foundNonEmpty) break;
    for (const createdAtColumn of createdAtCandidates) {
      if (foundNonEmpty) break;
      for (const pointsColumn of pointsCandidates) {
        if (foundNonEmpty) break;
        for (const filter of filters) {
          if (foundNonEmpty) break;
          try {
            const result = await fetchVisualizationRows(accessToken, {
              schema,
              createdAtColumn,
              pointsColumn,
              filterColumn: filter.column,
              filterValue: filter.value,
              rangeStartUtc,
              rangeEndUtc,
            });

            if (!hadSuccessfulQuery) {
              hadSuccessfulQuery = true;
              bestRows = result;
              bestCreatedAtKey = createdAtColumn;
              bestPointsKey = pointsColumn;
            }

            if (result.length) {
              bestRows = result;
              bestCreatedAtKey = createdAtColumn;
              bestPointsKey = pointsColumn;
              foundNonEmpty = true;
            }
          } catch {
            // continue with next combination
          }
        }
      }
    }
  }

  rows = bestRows;
  createdAtKey = bestCreatedAtKey;
  pointsKey = bestPointsKey;

  if (!rows.length) {
    return emptyHistory(period);
  }

  if (period === "weekly") {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(rangeStartLocal);
      date.setDate(rangeStartLocal.getDate() + index);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
    const sumsByIndex = Array<number>(7).fill(0);
    const indexByDate = new Map<number, number>();

    startDates.forEach((date, index) => {
      indexByDate.set(date.getTime(), index);
    });

    for (const row of rows) {
      const createdAtRaw = row[createdAtKey];
      if (!createdAtRaw) continue;

      const createdAt = new Date(String(createdAtRaw));
      if (Number.isNaN(createdAt.getTime())) continue;

      const localDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );
      const index = indexByDate.get(localDate.getTime());

      if (index === undefined) continue;

      sumsByIndex[index] += toNumber(row[pointsKey]);
    }

    return startDates.map((date, index) => ({
      label: dayLabels[date.getDay()] ?? "",
      points: sumsByIndex[index] ?? 0,
    }));
  }

  const sumsByBucket = Array<number>(4).fill(0);

  for (const row of rows) {
    const createdAtRaw = row[createdAtKey];
    if (!createdAtRaw) continue;

    const createdAt = new Date(String(createdAtRaw));
    if (Number.isNaN(createdAt.getTime())) continue;

    const daysFromStart = Math.floor(
      (createdAt.getTime() - rangeStartLocal.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysFromStart < 0 || daysFromStart >= 28) continue;

    const bucket = Math.floor(daysFromStart / 7);
    sumsByBucket[bucket] += toNumber(row[pointsKey]);
  }

  return sumsByBucket.map((points, index) => ({
    label: `Week ${index + 1}`,
    points,
  }));
}

export async function sendAffiliateInvitation(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerId: number;
}) {
  await fetchJson<void>(`${uwifiServerConfig.airflowBaseUrl}/afiliate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      customer_id: input.customerId,
    }),
    errorMessage: "No fue posible enviar la invitación del afiliado.",
  });
}

export async function getWalletDashboardData(
  customerId: number,
  customerAffiliateId: number | null,
  accessToken: string,
): Promise<WalletDashboardData> {
  const [points, paymentMethods, affiliatedUsers, weeklyHistory, monthlyHistory] =
    await Promise.all([
      getWalletPointsSummary(customerId, customerAffiliateId, accessToken),
      getPaymentMethods(customerId, accessToken),
      getAffiliatedUsers(customerId, accessToken),
      getWalletPointsHistory(customerId, customerAffiliateId, "weekly", accessToken),
      getWalletPointsHistory(customerId, customerAffiliateId, "monthly", accessToken),
    ]);

  return {
    points,
    paymentMethods,
    affiliatedUsers,
    weeklyHistory,
    monthlyHistory,
  };
}
