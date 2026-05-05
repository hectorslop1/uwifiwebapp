"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import {
  createSupportTicket,
  getSupportTicketCategories,
} from "@/src/server/support/api";

import type { CreateSupportTicketActionState } from "./support-action-state";

function isValidTitle(value: string) {
  return value.trim().length >= 3;
}

function isValidDescription(value: string) {
  return value.trim().length >= 10;
}

function getPathWithFlash(
  pathname: string,
  status: "success" | "error",
  message: string,
) {
  const params = new URLSearchParams({
    status,
    message,
  });

  return `${pathname}?${params.toString()}`;
}

export async function createSupportTicketAction(
  _prevState: CreateSupportTicketActionState,
  formData: FormData,
): Promise<CreateSupportTicketActionState> {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!isValidTitle(title)) {
    return {
      status: "error",
      message: "Please enter a short title for your ticket.",
    };
  }

  if (!isValidDescription(description)) {
    return {
      status: "error",
      message: "Please describe the issue with a bit more detail.",
    };
  }

  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    return {
      status: "error",
      message: "Please choose an issue type.",
    };
  }

  try {
    const categories = await getSupportTicketCategories(context.accessToken);
    const selectedCategory = categories.find((category) => category.id === categoryId);

    if (!selectedCategory) {
      return {
        status: "error",
        message: "The selected issue type is no longer available.",
      };
    }

    await createSupportTicket(
      {
        customerName: context.user.fullName,
        customerId: context.user.customerId,
        category: selectedCategory.issueName,
        title,
        description,
        files,
      },
      context.accessToken,
    );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We couldn't submit your ticket right now.",
    };
  }

  redirect(
    getPathWithFlash(
      "/support/tickets",
      "success",
      "Your ticket was submitted successfully.",
    ),
  );
}
