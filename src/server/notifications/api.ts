import "server-only";

import { uwifiServerConfig, uwifiSupabaseEndpoints } from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type { PortalNotification } from "./types";

type NotificationTypeRow = {
  type?: string | null;
  category?: string | null;
  color?: string | null;
  icon?: string | null;
  priority?: string | null;
};

type NotificationTemplateRow = {
  template_key?: string | null;
  icon?: string | null;
  requires_action?: boolean | null;
  action_label?: string | null;
  action_route?: string | null;
};

type NotificationRow = {
  notification_id?: number | null;
  created_at?: string | null;
  customer_fk?: number | null;
  message?: string | null;
  organization_fk?: number | null;
  notification_type_fk?: number | null;
  template_fk?: number | null;
  viewed_by?: string | null;
  viewed_at?: string | null;
  is_read?: boolean | null;
  priority?: string | null;
  action_taken?: boolean | null;
  action_taken_at?: string | null;
  variables?: Record<string, unknown> | null;
  notification_type?: NotificationTypeRow | null;
  notification_template?: NotificationTemplateRow | null;
};

function getSupabaseHeaders(accessToken: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function postRpc<T>(
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

function mapNotification(row: NotificationRow): PortalNotification {
  return {
    id: toNumber(row.notification_id),
    createdAt: row.created_at ?? "",
    customerId: toNumber(row.customer_fk),
    message: row.message?.trim() || "",
    organizationId: toNumber(row.organization_fk),
    notificationTypeId: toNumber(row.notification_type_fk),
    templateId:
      typeof row.template_fk === "number" ? row.template_fk : row.template_fk ?? null,
    viewedBy: row.viewed_by ?? null,
    viewedAt: row.viewed_at ?? null,
    isRead: row.is_read ?? false,
    priority: row.priority?.trim() || "normal",
    actionTaken: row.action_taken ?? false,
    actionTakenAt: row.action_taken_at ?? null,
    variables:
      row.variables && !Array.isArray(row.variables) ? row.variables : null,
    categoryType: row.notification_type?.type?.trim() || "UNKNOWN",
    categoryName: row.notification_type?.category?.trim() || "Notification",
    categoryColor: row.notification_type?.color?.trim() || "#607D8B",
    categoryIcon: row.notification_type?.icon?.trim() || "notifications",
    categoryPriority: row.notification_type?.priority?.trim() || "normal",
    templateKey: row.notification_template?.template_key?.trim() || null,
    templateIcon: row.notification_template?.icon?.trim() || null,
    requiresAction: row.notification_template?.requires_action ?? null,
    actionLabel: row.notification_template?.action_label?.trim() || null,
    actionRoute: row.notification_template?.action_route?.trim() || null,
  };
}

export async function getPortalNotifications(
  customerId: number,
  accessToken: string,
) {
  const params = new URLSearchParams({
    select:
      "notification_id,created_at,customer_fk,message,organization_fk,notification_type_fk,template_fk,viewed_by,viewed_at,is_read,priority,action_taken,action_taken_at,variables,notification_type!notification_type_fk(type,category,color,icon,priority),notification_template!template_fk(template_key,icon,requires_action,action_label,action_route)",
    customer_fk: `eq.${customerId}`,
    order: "created_at.desc",
  });

  const rows = await fetchJson<NotificationRow[]>(
    `${uwifiSupabaseEndpoints.rest}/notification?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "Unable to load your notifications right now.",
    },
  );

  return rows.map(mapNotification);
}

export async function markPortalNotificationAsRead(
  notificationId: number,
  userId: string,
  accessToken: string,
) {
  await postRpc<void>(
    "mark_notification_as_read",
    {
      p_notification_id: notificationId,
      p_user_id: userId,
    },
    accessToken,
    "Unable to mark this notification as read right now.",
  );
}

export async function markAllPortalNotificationsAsRead(
  customerId: number,
  userId: string,
  accessToken: string,
) {
  await postRpc<void>(
    "mark_all_notifications_as_read",
    {
      p_customer_id: customerId,
      p_user_id: userId,
    },
    accessToken,
    "Unable to mark all notifications as read right now.",
  );
}

export async function deletePortalNotification(
  notificationId: number,
  accessToken: string,
) {
  const params = new URLSearchParams({
    notification_id: `eq.${notificationId}`,
  });

  await fetchJson<void>(`${uwifiSupabaseEndpoints.rest}/notification?${params.toString()}`, {
    method: "DELETE",
    headers: {
      ...getSupabaseHeaders(accessToken),
      Prefer: "return=minimal",
    },
    errorMessage: "Unable to delete this notification right now.",
  });
}
