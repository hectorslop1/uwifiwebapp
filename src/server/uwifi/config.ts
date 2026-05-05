export const uwifiServerConfig = {
  supabaseUrl:
    process.env.UWIFI_SUPABASE_URL?.trim() || "https://db.u-wifi.com",
  supabaseAnonKey:
    process.env.UWIFI_SUPABASE_ANON_KEY?.trim() ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MjM4MDAwLAogICJleHAiOiAxODczMDA0NDAwCn0.qKqYn2vjtHqKqyt1FAghuIjvNsyr9b1ElpVfvJg6zJ4",
  airflowBaseUrl:
    process.env.UWIFI_AIRFLOW_BASE_URL?.trim() || "https://db.u-wifi.com/uapi",
  gatewayInfoWebhook:
    process.env.UWIFI_GATEWAY_INFO_URL?.trim() ||
    "https://n8nb.u-wifi.com/webhook/uwifi_gateway_zequence_info",
  passwordResetWebhook:
    process.env.UWIFI_PASSWORD_RESET_URL?.trim() ||
    "https://n8nb.u-wifi.com/webhook/uwifi_customer_reset_password",
  inviteBaseUrl:
    process.env.UWIFI_INVITE_BASE_URL?.trim() ||
    "https://u-wifi.virtalus.cbluna-dev.com/invite",
  zequenceBaseUrl:
    process.env.UWIFI_ZEQUENCE_BASE_URL?.trim() ||
    "https://control-dev.zequenze.com/api/v1",
  zequenceApiKey:
    process.env.UWIFI_ZEQUENCE_API_KEY?.trim() ||
    "d43bdbe46e77d09ef9674c240deb7cd0597d3aae",
} as const;

export const uwifiSupabaseEndpoints = {
  auth: `${uwifiServerConfig.supabaseUrl}/auth/v1`,
  rest: `${uwifiServerConfig.supabaseUrl}/rest/v1`,
  rpc: `${uwifiServerConfig.supabaseUrl}/rest/v1/rpc`,
} as const;
