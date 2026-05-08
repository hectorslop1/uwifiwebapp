"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  signInWithPassword,
} from "@/src/server/auth/api";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import {
  deletePortalNotification,
  markAllPortalNotificationsAsRead,
  markPortalNotificationAsRead,
} from "@/src/server/notifications/api";
import {
  updatePortalPassword,
  updateSettingsProfile,
} from "@/src/server/settings/api";

import type { SettingsSection } from "./settings-ui";

function buildSettingsRedirectPath(
  section: SettingsSection,
  status: "success" | "error",
  message: string,
) {
  const params = new URLSearchParams({
    section,
    status,
    message,
  });

  return `/settings?${params.toString()}`;
}

function cleanPhoneNumber(value: string) {
  return value.replace(/[^\d+()\-\s]/g, "").trim();
}

function isValidPhone(value: string) {
  if (!value.trim()) {
    return true;
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

export async function saveProfileSettingsAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = cleanPhoneNumber(String(formData.get("phone") ?? ""));

  if (firstName.length < 2) {
    redirect(
      buildSettingsRedirectPath(
        "account",
        "error",
        "Please enter a valid first name.",
      ),
    );
  }

  if (lastName.length < 2) {
    redirect(
      buildSettingsRedirectPath(
        "account",
        "error",
        "Please enter a valid last name.",
      ),
    );
  }

  if (!isValidPhone(phone)) {
    redirect(
      buildSettingsRedirectPath(
        "account",
        "error",
        "Please enter a valid phone number.",
      ),
    );
  }

  try {
    await updateSettingsProfile(context.user.customerId, context.accessToken, {
      firstName,
      lastName,
      phone,
    });

    revalidatePath("/settings");

    redirect(
      buildSettingsRedirectPath(
        "account",
        "success",
        "Profile updated successfully.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSettingsRedirectPath(
        "account",
        "error",
        error instanceof Error
          ? error.message
          : "Unable to save your profile settings right now.",
      ),
    );
  }
}

export async function changePasswordSettingsAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "").trim();
  const nextPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!currentPassword) {
    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        "Enter your current password to continue.",
      ),
    );
  }

  if (nextPassword.length < 8) {
    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        "Your new password must be at least 8 characters long.",
      ),
    );
  }

  if (nextPassword !== confirmPassword) {
    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        "The new password confirmation does not match.",
      ),
    );
  }

  if (currentPassword === nextPassword) {
    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        "Choose a new password that is different from your current one.",
      ),
    );
  }

  try {
    await signInWithPassword(context.user.email, currentPassword);
  } catch {
    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        "Your current password is incorrect.",
      ),
    );
  }

  try {
    await updatePortalPassword(context.accessToken, nextPassword);

    revalidatePath("/settings");

    redirect(
      buildSettingsRedirectPath(
        "security",
        "success",
        "Password updated successfully.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSettingsRedirectPath(
        "security",
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update your password right now.",
      ),
    );
  }
}

export async function markNotificationAsReadSettingsAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const notificationId = Number(formData.get("notificationId") ?? 0);

  if (!notificationId) {
    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "error",
        "Select a valid notification first.",
      ),
    );
  }

  try {
    await markPortalNotificationAsRead(
      notificationId,
      context.user.authId,
      context.accessToken,
    );

    revalidatePath("/settings");
    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "success",
        "Notification marked as read.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update the notification right now.",
      ),
    );
  }
}

export async function markAllNotificationsAsReadSettingsAction() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  try {
    await markAllPortalNotificationsAsRead(
      context.user.customerId,
      context.user.authId,
      context.accessToken,
    );

    revalidatePath("/settings");
    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "success",
        "All notifications were marked as read.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update notifications right now.",
      ),
    );
  }
}

export async function deleteNotificationSettingsAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    redirect("/login");
  }

  const notificationId = Number(formData.get("notificationId") ?? 0);

  if (!notificationId) {
    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "error",
        "Select a valid notification first.",
      ),
    );
  }

  try {
    await deletePortalNotification(notificationId, context.accessToken);

    revalidatePath("/settings");
    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "success",
        "Notification deleted.",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSettingsRedirectPath(
        "notifications",
        "error",
        error instanceof Error
          ? error.message
          : "Unable to delete this notification right now.",
      ),
    );
  }
}
