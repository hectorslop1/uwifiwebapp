"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import {
  getGatewayOverviewData,
  rebootGateway,
  updateDeviceVariable,
} from "@/src/server/gateway/api";
import type { GatewayOverviewData } from "@/src/server/gateway/types";

import { toGatewayOverview } from "@/src/server/gateway/api";

import type { WifiSettingsActionState } from "./gateway-action-state";

function getPathWithFlash(
  redirectTo: string,
  status: "success" | "error",
  message: string,
) {
  const params = new URLSearchParams({
    status,
    message,
  });

  return `${redirectTo}?${params.toString()}`;
}

function mergeUpdatedGatewayPasswords(
  gateway: GatewayOverviewData,
  formData: FormData,
) {
  const nextTwoFourPassword = String(formData.get("passwordTwoFour") ?? "").trim();
  const nextFiveGPassword = String(formData.get("passwordFiveG") ?? "").trim();

  return toGatewayOverview({
    ...gateway,
    wifi24GPassword: nextTwoFourPassword || gateway.wifi24GPassword,
    wifi5GPassword: nextFiveGPassword || gateway.wifi5GPassword,
  });
}

export async function saveWifiSettingsAction(
  _prevState: WifiSettingsActionState,
  formData: FormData,
): Promise<WifiSettingsActionState> {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return {
      status: "error",
      message: "Your session expired. Please sign in again.",
      gateway: null,
    };
  }

  const currentGateway = await getGatewayOverviewData(
    context.user.customerId,
    context.accessToken,
  );

  if (!currentGateway) {
    return {
      status: "error",
      message: "No gateway is connected to this account right now.",
      gateway: null,
    };
  }

  const nextTwoFourSsid = String(formData.get("ssidTwoFour") ?? "").trim();
  const nextFiveGSsid = String(formData.get("ssidFiveG") ?? "").trim();
  const nextTwoFourPassword = String(formData.get("passwordTwoFour") ?? "").trim();
  const nextFiveGPassword = String(formData.get("passwordFiveG") ?? "").trim();

  if (!nextTwoFourSsid || !nextFiveGSsid) {
    return {
      status: "error",
      message: "Both Wi‑Fi network names are required.",
      gateway: currentGateway,
    };
  }

  if (!nextTwoFourPassword || !nextFiveGPassword) {
    return {
      status: "error",
      message: "Both Wi‑Fi passwords are required.",
      gateway: currentGateway,
    };
  }

  if (nextTwoFourPassword.length < 8 || nextFiveGPassword.length < 8) {
    return {
      status: "error",
      message: "Wi‑Fi passwords must be at least 8 characters long.",
      gateway: currentGateway,
    };
  }

  const pendingUpdates: Array<Promise<void>> = [];

  if (nextTwoFourSsid !== currentGateway.wifi24GName) {
    pendingUpdates.push(
      updateDeviceVariable(
        currentGateway.serialNumber,
        "Device.WiFi.SSID.1.SSID",
        nextTwoFourSsid,
      ),
    );
  }

  if (nextFiveGSsid !== currentGateway.wifi5GName) {
    pendingUpdates.push(
      updateDeviceVariable(
        currentGateway.serialNumber,
        "Device.WiFi.SSID.3.SSID",
        nextFiveGSsid,
      ),
    );
  }

  if (nextTwoFourPassword !== (currentGateway.wifi24GPassword ?? "")) {
    pendingUpdates.push(
      updateDeviceVariable(
        currentGateway.serialNumber,
        "Device.WiFi.SSID.1.Password",
        nextTwoFourPassword,
      ),
    );
  }

  if (nextFiveGPassword !== (currentGateway.wifi5GPassword ?? "")) {
    pendingUpdates.push(
      updateDeviceVariable(
        currentGateway.serialNumber,
        "Device.WiFi.SSID.3.Password",
        nextFiveGPassword,
      ),
    );
  }

  if (!pendingUpdates.length) {
    return {
      status: "success",
      message: "Your Wi‑Fi settings are already up to date.",
      gateway: currentGateway,
    };
  }

  try {
    await Promise.all(pendingUpdates);

    revalidatePath("/gateway");
    revalidatePath("/gateway/devices");
    revalidatePath("/gateway/wifi");

    const refreshedGateway = await getGatewayOverviewData(
      context.user.customerId,
      context.accessToken,
    );

    return {
      status: "success",
      message: "Wi‑Fi settings updated successfully.",
      gateway: refreshedGateway
        ? mergeUpdatedGatewayPasswords(refreshedGateway, formData)
        : currentGateway,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update the Wi‑Fi settings right now.",
      gateway: currentGateway,
    };
  }
}

export async function rebootGatewayAction(formData: FormData) {
  const context = await getAuthenticatedPortalContext();
  const redirectTo = String(formData.get("redirectTo") ?? "/gateway");

  if (!context) {
    redirect(getPathWithFlash("/login", "error", "Please sign in again."));
  }

  const gateway = await getGatewayOverviewData(
    context.user.customerId,
    context.accessToken,
  );

  if (!gateway) {
    redirect(
      getPathWithFlash(
        redirectTo,
        "error",
        "No gateway is connected to this account right now.",
      ),
    );
  }

  try {
    await rebootGateway(gateway.serialNumber);

    revalidatePath("/gateway");
    revalidatePath("/gateway/devices");
    revalidatePath("/gateway/wifi");

    redirect(
      getPathWithFlash(
        redirectTo,
        "success",
        "The gateway reboot has started. It may take a few minutes to come back online.",
      ),
    );
  } catch (error) {
    redirect(
      getPathWithFlash(
        redirectTo,
        "error",
        error instanceof Error
          ? error.message
          : "Unable to start the gateway reboot right now.",
      ),
    );
  }
}
