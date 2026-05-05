import "server-only";

import { uwifiServerConfig, uwifiSupabaseEndpoints } from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type {
  BillingInvoice,
  BillingOverviewData,
  BillingPeriod,
  BillingTransaction,
  PaymentMethod,
} from "./types";

type BillingPeriodResponse = {
  due_date?: string | null;
  current_billing_period?: {
    start_date?: string | null;
    end_date?: string | null;
    balance?: number | null;
  } | null;
};

type CustomerDetailsResponse = {
  billing_cycle?: {
    automatic_charge?: boolean | null;
  } | null;
};

type InvoiceRow = {
  invoice_id?: number | null;
  invoice_number?: string | null;
  customer_id?: number | null;
  created_at?: string | null;
  due_date?: string | null;
  balance?: number | null;
  closing_balance?: number | null;
  discount?: number | null;
  u_points?: number | null;
  payment_id?: number | null;
  services?: Array<Record<string, unknown>> | null;
  current_billing_period?: Record<string, unknown> | null;
  file_url?: string | null;
  file_name?: string | null;
  title?: string | null;
  metadata_json?: Record<string, unknown> | null;
};

type CreditCardRow = {
  credit_card_id?: number | null;
  id?: number | null;
  customer_fk?: number | null;
  card_holder?: string | null;
  last_4_digits?: string | null;
  expiration_month?: string | null;
  expiration_year?: string | null;
  exp_month?: string | null;
  exp_year?: string | null;
  card_brand?: string | null;
  token?: string | null;
  is_default?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type RegisterCreditCardInput = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  cardHolder: string;
};

function getSupabaseHeaders(accessToken: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
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

function detectCardBrand(token: string | null) {
  const digits = (token ?? "").replace(/\D/g, "");

  if (!digits) {
    return "Credit Card";
  }

  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (digits.startsWith("6011") || /^65/.test(digits) || /^64[4-9]/.test(digits)) {
    return "Discover";
  }
  if (/^35/.test(digits)) return "JCB";
  if (/^30[0-5]/.test(digits) || digits.startsWith("36") || digits.startsWith("38")) {
    return "Diners Club";
  }

  return "Credit Card";
}

function mapPaymentMethod(row: CreditCardRow): PaymentMethod {
  const tokenLast4 =
    row.token && row.token.length >= 4 ? row.token.slice(-4) : "";

  return {
    id: row.credit_card_id ?? row.id ?? 0,
    customerId: row.customer_fk ?? 0,
    cardHolder: row.card_holder ?? "",
    last4Digits: row.last_4_digits ?? tokenLast4,
    expirationMonth: row.expiration_month ?? row.exp_month ?? "",
    expirationYear: row.expiration_year ?? row.exp_year ?? "",
    cardBrand:
      row.card_brand && row.card_brand.toLowerCase() !== "unknown"
        ? row.card_brand
        : detectCardBrand(row.token ?? null),
    token: row.token ?? null,
    isDefault: row.is_default ?? false,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function getInvoiceTotalAmount(invoice: InvoiceRow) {
  let totalAmount = 0;

  for (const service of invoice.services ?? []) {
    totalAmount += toNumber(service.amount);
  }

  if (!totalAmount && invoice.metadata_json) {
    totalAmount = toNumber(invoice.metadata_json.total_amount);
  }

  if (!totalAmount) {
    totalAmount = toNumber(invoice.balance);
  }

  if (!totalAmount) {
    totalAmount = toNumber(invoice.closing_balance);
  }

  if (!totalAmount && invoice.current_billing_period) {
    totalAmount = toNumber(invoice.current_billing_period.balance);
  }

  return totalAmount;
}

function mapInvoice(row: InvoiceRow): BillingInvoice {
  const totalAmount = getInvoiceTotalAmount(row);
  const paymentId = row.payment_id ?? null;

  return {
    invoiceId: row.invoice_id ?? 0,
    invoiceNumber: row.invoice_number ?? "N/A",
    customerId: row.customer_id ?? 0,
    createdAt: row.created_at ?? "",
    dueDate: row.due_date ?? "",
    balance: toNumber(row.balance),
    closingBalance: toNumber(row.closing_balance),
    discount: toNumber(row.discount),
    uPoints: toNumber(row.u_points),
    paymentId,
    services: row.services ?? [],
    currentBillingPeriod: row.current_billing_period ?? {},
    fileUrl: row.file_url ?? null,
    fileName: row.file_name ?? null,
    title: row.title ?? null,
    metadataJson: row.metadata_json ?? null,
    totalAmount,
    status: paymentId ? "Paid" : "Pending",
  };
}

function invoiceToTransaction(invoice: BillingInvoice): BillingTransaction {
  const isPaid = Boolean(invoice.paymentId);

  return {
    id: `invoice-${invoice.invoiceId}`,
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    transactionType: isPaid ? "Invoice payment" : "Pending invoice",
    amount: invoice.totalAmount,
    status: isPaid ? "Settled" : "Pending",
    methodLabel: isPaid ? "Recorded payment" : "Awaiting payment",
  };
}

function getPendingInvoiceAmount(invoices: BillingInvoice[]) {
  return invoices
    .filter((invoice) => invoice.status === "Pending")
    .reduce((sum, invoice) => {
      const pendingAmount =
        invoice.balance > 0 ? invoice.balance : invoice.totalAmount;
      return sum + pendingAmount;
    }, 0);
}

function getBillingAmountDue(
  balance: number,
  billingPeriod: BillingPeriod | null,
  invoices: BillingInvoice[],
) {
  const periodBalance = billingPeriod?.currentBillingPeriod.balance ?? 0;
  const pendingInvoiceAmount = getPendingInvoiceAmount(invoices);

  return Math.max(balance, periodBalance, pendingInvoiceAmount, 0);
}

async function patchCreditCards(
  query: string,
  payload: Record<string, unknown>,
  accessToken: string,
  errorMessage: string,
) {
  return fetchJson<void>(`${uwifiSupabaseEndpoints.rest}/credit_card?${query}`, {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(accessToken),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
    errorMessage,
  });
}

export async function getCurrentBillingPeriod(
  customerId: number,
  accessToken: string,
): Promise<BillingPeriod | null> {
  const response = await postRpc<BillingPeriodResponse | null>(
    "get_current_billing_period",
    { customer_id: String(customerId) },
    accessToken,
    "No fue posible obtener el período de facturación.",
  );

  if (!response) {
    return null;
  }

  return {
    dueDate: response.due_date ?? "",
    currentBillingPeriod: {
      startDate: response.current_billing_period?.start_date ?? "",
      endDate: response.current_billing_period?.end_date ?? "",
      balance:
        typeof response.current_billing_period?.balance === "number"
          ? response.current_billing_period.balance
          : null,
    },
  };
}

export async function getCustomerBalance(customerId: number, accessToken: string) {
  const response = await postRpc<number | null>(
    "get_customer_balance",
    { customer_id_param: String(customerId) },
    accessToken,
    "No fue posible obtener el balance del cliente.",
  );

  return toNumber(response);
}

export async function getAutomaticChargeStatus(
  customerId: number,
  accessToken: string,
) {
  const response = await postRpc<CustomerDetailsResponse[] | CustomerDetailsResponse | null>(
    "get_customer_details",
    { customer_id: customerId },
    accessToken,
    "No fue posible obtener la configuración de AutoPay.",
  );

  const details = Array.isArray(response) ? response[0] : response;
  const automaticCharge = details?.billing_cycle?.automatic_charge;

  return typeof automaticCharge === "boolean" ? automaticCharge : null;
}

export async function getPaymentMethods(
  customerId: number,
  accessToken: string,
) {
  const params = new URLSearchParams({
    customer_fk: `eq.${customerId}`,
    is_active: "eq.true",
    select: "*",
    order: "is_default.desc,created_at.desc",
  });

  const rows = await fetchJson<CreditCardRow[]>(
    `${uwifiSupabaseEndpoints.rest}/credit_card?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "No fue posible obtener los métodos de pago.",
    },
  );

  return rows.map(mapPaymentMethod);
}

export async function getInvoices(customerId: number, accessToken: string) {
  const params = new URLSearchParams({
    customer_id: `eq.${customerId}`,
    select:
      "invoice_id,invoice_number,customer_id,created_at,due_date,balance,closing_balance,discount,u_points,payment_id,services,current_billing_period,file_url,file_name,title,metadata_json",
    order: "created_at.desc",
  });

  const rows = await fetchJson<InvoiceRow[]>(
    `${uwifiSupabaseEndpoints.rest}/invoice_media_file?${params.toString()}`,
    {
      headers: getSupabaseHeaders(accessToken),
      errorMessage: "No fue posible obtener las facturas.",
    },
  );

  return rows.map(mapInvoice);
}

export async function getTransactions(customerId: number, accessToken: string) {
  const invoices = await getInvoices(customerId, accessToken);
  return invoices.map(invoiceToTransaction);
}

export async function getBillingOverviewData(
  customerId: number,
  accessToken: string,
): Promise<BillingOverviewData> {
  const results = await Promise.allSettled([
    getCurrentBillingPeriod(customerId, accessToken),
    getCustomerBalance(customerId, accessToken),
    getAutomaticChargeStatus(customerId, accessToken),
    getPaymentMethods(customerId, accessToken),
    getInvoices(customerId, accessToken),
  ]);

  const billingPeriod =
    results[0].status === "fulfilled" ? results[0].value : null;
  const balance = results[1].status === "fulfilled" ? results[1].value : 0;
  const autoPayEnabled =
    results[2].status === "fulfilled" ? results[2].value : null;
  const paymentMethods =
    results[3].status === "fulfilled" ? results[3].value : [];
  const invoices = results[4].status === "fulfilled" ? results[4].value : [];
  const amountDue = getBillingAmountDue(balance, billingPeriod, invoices);

  return {
    billingPeriod,
    balance,
    amountDue,
    autoPayEnabled,
    paymentMethods,
    invoices,
    transactions: invoices.map(invoiceToTransaction),
  };
}

export async function updateAutomaticCharge(
  customerId: number,
  value: boolean,
  accessToken: string,
) {
  await postRpc(
    "update_automatic_charge",
    { customerid: customerId, value },
    accessToken,
    "No fue posible actualizar AutoPay.",
  );
}

export async function setDefaultPaymentMethod(
  customerId: number,
  cardId: number,
  accessToken: string,
) {
  await patchCreditCards(
    `customer_fk=eq.${customerId}`,
    { is_default: false },
    accessToken,
    "No fue posible actualizar la tarjeta por defecto.",
  );

  await patchCreditCards(
    `credit_card_id=eq.${cardId}&customer_fk=eq.${customerId}`,
    { is_default: true },
    accessToken,
    "No fue posible establecer la tarjeta por defecto.",
  );
}

export async function deletePaymentMethod(
  customerId: number,
  cardId: number,
  accessToken: string,
) {
  await patchCreditCards(
    `credit_card_id=eq.${cardId}&customer_fk=eq.${customerId}`,
    { is_active: false },
    accessToken,
    "No fue posible eliminar la tarjeta.",
  );
}

export async function registerPaymentMethod(
  customerId: number,
  input: RegisterCreditCardInput,
) {
  await fetchJson<void>(`${uwifiServerConfig.airflowBaseUrl}/register-new-creditcard`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({
      customer_id: customerId,
      credit_card: {
        card_number: input.cardNumber,
        exp_month: input.expMonth,
        exp_year: input.expYear,
        cvv: input.cvv,
        card_holder: input.cardHolder,
      },
    }),
    errorMessage: "No fue posible registrar la tarjeta.",
  });
}

export async function createManualBilling(
  customerId: number,
  billingDate: string,
  discount: number,
  autoPayment: boolean,
) {
  await fetchJson<void>(`${uwifiServerConfig.airflowBaseUrl}/create-manual-billing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: customerId,
      billing_date: billingDate,
      discount,
      auto_payment: autoPayment,
    }),
    errorMessage: "No fue posible generar el pago manual.",
  });
}
