export type ConnectedDevice = {
  id: string;
  name: string;
  ipAddress: string | null;
  macAddress: string | null;
  connectionType: string | null;
  band: "2.4 GHz" | "5 GHz";
};

export type GatewayNetwork = {
  key: "twoFour" | "fiveG";
  title: string;
  band: "2.4 GHz" | "5 GHz";
  ssid: string;
  password: string | null;
  devices: ConnectedDevice[];
};

export type GatewaySnapshot = {
  serialNumber: string;
  connectionStatus: string;
  wifiName: string;
  wifi24GName: string;
  wifi5GName: string;
  wifi24GPassword: string | null;
  wifi5GPassword: string | null;
  ipAddress: string | null;
  uptime: string | null;
  devices24G: ConnectedDevice[];
  devices5G: ConnectedDevice[];
};

export type GatewayOverviewData = GatewaySnapshot & {
  totalDevices: number;
  isConnected: boolean;
  networks: GatewayNetwork[];
};
