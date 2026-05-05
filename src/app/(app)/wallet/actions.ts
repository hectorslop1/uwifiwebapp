"use server";

import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { sendAffiliateInvitation } from "@/src/server/wallet/api";

import type { AffiliateInviteActionState } from "./wallet-action-state";

function isValidEmail(value: string) {
  return /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i.test(value);
}

function isValidPhone(value: string) {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned.length >= 10;
}

export async function sendAffiliateInvitationAction(
  _prevState: AffiliateInviteActionState,
  formData: FormData,
): Promise<AffiliateInviteActionState> {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return {
      status: "error",
      message: "Your session expired. Please sign in again.",
    };
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (firstName.length < 2) {
    return {
      status: "error",
      message: "Please enter a valid first name.",
    };
  }

  if (lastName.length < 2) {
    return {
      status: "error",
      message: "Please enter a valid last name.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  if (!isValidPhone(phone)) {
    return {
      status: "error",
      message: "Please enter a valid phone number.",
    };
  }

  try {
    await sendAffiliateInvitation({
      firstName,
      lastName,
      email,
      phone,
      customerId: context.user.customerId,
    });

    return {
      status: "success",
      message: "Affiliate invitation sent successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to send the affiliate invitation right now.",
    };
  }
}
