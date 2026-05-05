import "server-only";

import { uwifiServerConfig, uwifiSupabaseEndpoints } from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type {
  CreateSupportTicketInput,
  SupportTicket,
  SupportTicketCategory,
} from "./types";

type SupportTicketCategoryRow = {
  id?: number | null;
  issue_name?: string | null;
  category_name?: string | null;
  created_at?: string | null;
};

type SupportTicketRow = {
  id?: number | null;
  ticket_id?: number | null;
  customer_name?: string | null;
  category?: string | null;
  type?: string | null;
  description?: string | null;
  customer_id_fk?: number | null;
  file?: string[] | string | null;
  created_at?: string | null;
  status?: string | null;
  title?: string | null;
  assigned_to?: string | null;
  agent_name?: string | null;
};

const SUPPORT_TICKET_BUCKET = "support_tickets_file";
const SUPPORT_TICKET_FOLDER = "ticket_images";

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

function normalizeFiles(value: SupportTicketRow["file"]) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

function mapCategory(row: SupportTicketCategoryRow): SupportTicketCategory {
  return {
    id: toNumber(row.id),
    issueName: row.issue_name?.trim() || "General issue",
    category: row.category_name?.trim() || "Support",
    createdAt: row.created_at ?? null,
  };
}

function mapTicket(row: SupportTicketRow): SupportTicket {
  return {
    id: toNumber(row.ticket_id ?? row.id),
    customerName: row.customer_name?.trim() || "Customer",
    category: row.category?.trim() || "Support",
    type: row.type?.trim() || "Support",
    description: row.description?.trim() || "",
    customerId: toNumber(row.customer_id_fk),
    files: normalizeFiles(row.file),
    createdAt: row.created_at ?? null,
    status: row.status ?? null,
    title: row.title ?? null,
    assignedTo: row.assigned_to ?? row.agent_name ?? null,
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

export async function getSupportTicketCategories(accessToken: string) {
  const params = new URLSearchParams({
    select: "id,issue_name,category_name,created_at",
    order: "id.asc",
  });

  const response = await fetchJson<SupportTicketCategoryRow[]>(
    `${uwifiSupabaseEndpoints.rest}/support_ticket_category?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "We couldn't load support categories right now.",
    },
  );

  return response.map(mapCategory);
}

export async function getCustomerSupportTickets(
  customerId: number,
  accessToken: string,
) {
  const response = await postRpc<SupportTicketRow[] | null>(
    "get_customer_tickets",
    { p_customer_id: customerId },
    accessToken,
    "We couldn't load your support tickets right now.",
  );

  const rows = Array.isArray(response) ? response : [];
  return rows.map(mapTicket);
}

async function uploadSupportFile(file: File, accessToken: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;
  const filePath = `${SUPPORT_TICKET_FOLDER}/${fileName}`;
  const uploadUrl =
    `${uwifiServerConfig.supabaseUrl}/storage/v1/object/` +
    `${SUPPORT_TICKET_BUCKET}/${filePath}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: uwifiServerConfig.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "x-upsert": "false",
      "Content-Type": file.type || "application/octet-stream",
    },
    body: bytes,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "We couldn't upload one of the attachments.");
  }

  return (
    `${uwifiServerConfig.supabaseUrl}/storage/v1/object/public/` +
    `${SUPPORT_TICKET_BUCKET}/${filePath}`
  );
}

async function uploadSupportFiles(files: File[], accessToken: string) {
  const uploadedFiles: string[] = [];

  for (const file of files) {
    uploadedFiles.push(await uploadSupportFile(file, accessToken));
  }

  return uploadedFiles;
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
  accessToken: string,
) {
  const files = (input.files ?? []).filter((file) => file.size > 0);
  const uploadedFiles = files.length
    ? await uploadSupportFiles(files, accessToken)
    : [];

  await fetchJson<void>(`${uwifiSupabaseEndpoints.rest}/support_tickets`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(accessToken),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      customer_name: input.customerName,
      category: input.category,
      type: "Support",
      description: input.description,
      customer_id_fk: input.customerId,
      title: input.title,
      ...(uploadedFiles.length ? { file: uploadedFiles } : {}),
    }),
    errorMessage: "We couldn't create your support ticket right now.",
  });
}
