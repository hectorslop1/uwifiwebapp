"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import {
  createManualBilling,
  deletePaymentMethod,
  getBillingOverviewData,
  registerPaymentMethod,
  setDefaultPaymentMethod,
  updateAutomaticCharge,
} from "@/src/server/billing/api";

function getBillingRedirectPath(
  pathname: string,
  status: string,
  message: string,
) {
  const params = new URLSearchParams({
    status,
    message,
  });

  return `${pathname}?${params.toString()}`;
}

function revalidateBillingRoutes() {
  revalidatePath("/billing");
  revalidatePath("/billing/invoices");
  revalidatePath("/billing/payment-methods");
  revalidatePath("/billing/transactions");
}

export async function toggleAutopayAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const enable = String(formData.get("enable") ?? "") === "true";

  try {
    await updateAutomaticCharge(
      context.user.customerId,
      enable,
      context.accessToken,
    );

    revalidateBillingRoutes();

    redirect(
      getBillingRedirectPath(
        "/billing",
        "success",
        enable ? "AutoPay enabled." : "AutoPay disabled.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      getBillingRedirectPath(
        "/billing",
        "error",
        error instanceof Error
          ? error.message
          : "No fue posible actualizar AutoPay.",
      ),
    );
  }
}

export async function payBalanceNowAction() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  try {
    const overview = await getBillingOverviewData(
      context.user.customerId,
      context.accessToken,
    );

    const billingDate = overview.billingPeriod?.dueDate;

    if (!billingDate) {
      redirect(
        getBillingRedirectPath(
          "/billing",
          "error",
          "No billing date is available for this account yet.",
        ),
      );
    }

    await createManualBilling(
      context.user.customerId,
      billingDate,
      0,
      false,
    );

    revalidateBillingRoutes();

    redirect(
      getBillingRedirectPath(
        "/billing",
        "success",
        "Manual payment request created successfully.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      getBillingRedirectPath(
        "/billing",
        "error",
        error instanceof Error
          ? error.message
          : "No fue posible generar el pago manual.",
      ),
    );
  }
}

export async function setDefaultPaymentMethodAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const cardId = Number(formData.get("cardId") ?? 0);

  try {
    await setDefaultPaymentMethod(
      context.user.customerId,
      cardId,
      context.accessToken,
    );

    revalidateBillingRoutes();
    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "success",
        "Default payment method updated.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "error",
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la tarjeta por defecto.",
      ),
    );
  }
}

export async function deletePaymentMethodAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const cardId = Number(formData.get("cardId") ?? 0);

  try {
    await deletePaymentMethod(
      context.user.customerId,
      cardId,
      context.accessToken,
    );

    revalidateBillingRoutes();
    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "success",
        "Payment method removed.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "error",
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la tarjeta.",
      ),
    );
  }
}

export async function addPaymentMethodAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const cardHolder = String(formData.get("cardHolder") ?? "").trim();
  const cardNumber = String(formData.get("cardNumber") ?? "")
    .replace(/\s+/g, "")
    .trim();
  const expMonth = String(formData.get("expMonth") ?? "").trim();
  const expYear = String(formData.get("expYear") ?? "").trim();
  const cvv = String(formData.get("cvv") ?? "").trim();

  if (!cardHolder || !cardNumber || !expMonth || !expYear || !cvv) {
    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "error",
        "Complete all card fields before saving the payment method.",
      ),
    );
  }

  try {
    await registerPaymentMethod(context.user.customerId, {
      cardHolder,
      cardNumber,
      expMonth,
      expYear,
      cvv,
    });

    revalidateBillingRoutes();
    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "success",
        "Payment method added successfully.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      getBillingRedirectPath(
        "/billing/payment-methods",
        "error",
        error instanceof Error
          ? error.message
          : "No fue posible registrar la tarjeta.",
      ),
    );
  }
}
