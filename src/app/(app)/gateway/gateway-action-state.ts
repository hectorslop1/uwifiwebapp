import type { GatewayOverviewData } from "@/src/server/gateway/types";

export type WifiSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
  gateway: GatewayOverviewData | null;
};

export const initialWifiSettingsActionState: WifiSettingsActionState = {
  status: "idle",
  message: "",
  gateway: null,
};
