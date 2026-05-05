import "server-only";

import { uwifiServerConfig, uwifiSupabaseEndpoints } from "@/src/server/uwifi/config";
import { fetchJson } from "@/src/server/uwifi/fetch";

import type {
  ConnectedDevice,
  GatewayOverviewData,
  GatewaySnapshot,
} from "./types";

type CustomerBundleRow = {
  gateway?: {
    serie_no?: string | null;
  } | null;
};

type GatewayResultRow = {
  name?: string | null;
  value?: unknown;
  type?: string | null;
};

type GatewayWebhookResponse = {
  results?: GatewayResultRow[] | null;
};

type DeviceVariablePayload = {
  variable_name: string;
  value: string;
};

function getSupabaseHeaders(accessToken: string) {
  return {
    apikey: uwifiServerConfig.supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function getZequenceHeaders() {
  return {
    Accept: "application/json",
    Authorization: uwifiServerConfig.zequenceApiKey,
    "Content-Type": "application/json",
  };
}

function toTextValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getFirstTextValue(
  record: Record<string, unknown>,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function sanitizeMacAddress(value: string) {
  return value.replace(/[^0-9a-f:.-]/gi, "").trim();
}

function findGatewayValue(results: GatewayResultRow[], name: string) {
  return results.find((item) => item.name === name)?.value;
}

function parseConnectedDevices(value: unknown, band: "2.4 GHz" | "5 GHz") {
  let rawDevices: unknown[] = [];

  if (Array.isArray(value)) {
    rawDevices = value;
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        rawDevices = parsed;
      }
    } catch {
      rawDevices = [];
    }
  }

  return rawDevices
    .map((device, index): ConnectedDevice | null => {
      if (!device || typeof device !== "object") {
        return null;
      }

      const record = device as Record<string, unknown>;
      const macAddress = sanitizeMacAddress(
        getFirstTextValue(record, [
          "mac_address",
          "macAddress",
          "mac",
          "MACAddress",
          "AssociatedDeviceMACAddress",
          "PhysAddress",
          "phys_address",
        ]),
      );
      const ipAddress = getFirstTextValue(record, [
        "ip_address",
        "ipAddress",
        "ip",
        "IPAddress",
        "AssociatedDeviceIPAddress",
        "IPv4Address",
        "host_ip",
      ]);
      const hostname = getFirstTextValue(record, [
        "name",
        "hostname",
        "host_name",
        "hostName",
        "HostName",
        "friendly_name",
        "friendlyName",
        "device_name",
        "DeviceName",
        "AssociatedDeviceHostname",
      ]);
      const vendor = getFirstTextValue(record, [
        "manufacturer",
        "vendor",
        "Manufacturer",
        "oui_vendor",
        "OuiVendor",
      ]);
      const connectionType = getFirstTextValue(
        record,
        [
          "connection_type",
          "connectionType",
          "interface_type",
          "InterfaceType",
          "medium",
          "Medium",
        ],
        "Wi‑Fi",
      );
      const deviceSuffix = macAddress
        ? macAddress.replace(/[^0-9a-f]/gi, "").slice(-4).toUpperCase()
        : String(index + 1).padStart(2, "0");
      const name =
        hostname ||
        (vendor ? `${vendor} device ${deviceSuffix}` : `Device ${deviceSuffix}`);

      return {
        id: `${band}-${macAddress || ipAddress || index}`,
        name,
        ipAddress: ipAddress || null,
        macAddress: macAddress || null,
        connectionType: connectionType || null,
        band,
      };
    })
    .filter((device): device is ConnectedDevice => Boolean(device));
}

function mapGatewaySnapshot(
  serialNumber: string,
  response: GatewayWebhookResponse,
): GatewaySnapshot {
  const results = Array.isArray(response.results) ? response.results : [];
  const devices24G = parseConnectedDevices(
    findGatewayValue(results, "Device.WiFi.Accesspoint.1.AssociatedDevice."),
    "2.4 GHz",
  );
  const devices5G = parseConnectedDevices(
    findGatewayValue(results, "Device.WiFi.Accesspoint.3.AssociatedDevice."),
    "5 GHz",
  );

  return {
    serialNumber,
    connectionStatus: toTextValue(
      findGatewayValue(
        results,
        "Device.X_Web.MobileNetwork.ConnectionStatus.ConnectionStatus",
      ),
      "Unknown",
    ),
    wifiName: toTextValue(
      findGatewayValue(results, "Device.WiFi.SSID.1.SSID"),
      "UWiFi",
    ),
    wifi24GName: toTextValue(
      findGatewayValue(results, "Device.WiFi.SSID.1.SSID"),
      "UWiFi",
    ),
    wifi5GName: toTextValue(
      findGatewayValue(results, "Device.WiFi.SSID.3.SSID"),
      "UWiFi 5G",
    ),
    wifi24GPassword:
      toTextValue(findGatewayValue(results, "Device.WiFi.SSID.1.Password")) || null,
    wifi5GPassword:
      toTextValue(findGatewayValue(results, "Device.WiFi.SSID.3.Password")) || null,
    ipAddress:
      toTextValue(
        findGatewayValue(results, "Device.X_Web.MobileNetwork.IPv4Address.IPAddress"),
      ) || null,
    uptime:
      toTextValue(findGatewayValue(results, "Device.DeviceInfo.UpTime")) || null,
    devices24G,
    devices5G,
  };
}

export function toGatewayOverview(snapshot: GatewaySnapshot): GatewayOverviewData {
  return {
    ...snapshot,
    totalDevices: snapshot.devices24G.length + snapshot.devices5G.length,
    isConnected: snapshot.connectionStatus.toLowerCase() === "connected",
    networks: [
      {
        key: "fiveG",
        title: snapshot.wifi5GName || "5 GHz network",
        band: "5 GHz",
        ssid: snapshot.wifi5GName || "",
        password: snapshot.wifi5GPassword,
        devices: snapshot.devices5G,
      },
      {
        key: "twoFour",
        title: snapshot.wifi24GName || "2.4 GHz network",
        band: "2.4 GHz",
        ssid: snapshot.wifi24GName || "",
        password: snapshot.wifi24GPassword,
        devices: snapshot.devices24G,
      },
    ],
  };
}

export async function getCustomerGatewaySerial(
  customerId: number,
  accessToken: string,
) {
  const response = await fetchJson<CustomerBundleRow[] | null>(
    `${uwifiSupabaseEndpoints.rpc}/customer_bundle`,
    {
      method: "POST",
      headers: getSupabaseHeaders(accessToken),
      body: JSON.stringify({ customer_id: customerId }),
      errorMessage: "No fue posible obtener el gateway asignado a esta cuenta.",
    },
  );

  const serialNumber = response?.[0]?.gateway?.serie_no?.trim();

  if (!serialNumber) {
    return null;
  }

  return serialNumber;
}

export async function getGatewaySnapshotBySerial(serialNumber: string) {
  const response = await fetchJson<GatewayWebhookResponse>(
    uwifiServerConfig.gatewayInfoWebhook,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent__serial_number: serialNumber }),
      errorMessage: "No fue posible cargar la información del gateway.",
    },
  );

  return mapGatewaySnapshot(serialNumber, response);
}

export async function getGatewayOverviewData(
  customerId: number,
  accessToken: string,
) {
  const serialNumber = await getCustomerGatewaySerial(customerId, accessToken);

  if (!serialNumber) {
    return null;
  }

  const snapshot = await getGatewaySnapshotBySerial(serialNumber);
  return toGatewayOverview(snapshot);
}

export async function updateDeviceVariable(
  serialNumber: string,
  variableName: string,
  value: string,
) {
  return fetchJson<void>(
    `${uwifiServerConfig.zequenceBaseUrl}/inventory_device_serial_variables/${serialNumber}/`,
    {
      method: "PUT",
      headers: getZequenceHeaders(),
      body: JSON.stringify({
        variable_name: variableName,
        value,
      } satisfies DeviceVariablePayload),
      errorMessage: "No fue posible actualizar la configuración Wi‑Fi.",
    },
  );
}

export async function rebootGateway(serialNumber: string) {
  return fetchJson<void>(
    `${uwifiServerConfig.zequenceBaseUrl}/inventory_device_serial_operations/${serialNumber}/`,
    {
      method: "POST",
      headers: getZequenceHeaders(),
      body: JSON.stringify({ operation: "reboot" }),
      errorMessage: "No fue posible reiniciar el gateway.",
    },
  );
}
