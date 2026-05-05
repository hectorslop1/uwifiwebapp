export type SettingsSection =
  | "account"
  | "security"
  | "preferences"
  | "notifications";

export type SettingsFlashMessage = {
  status: "success" | "error";
  message: string;
};

const sections = new Set<SettingsSection>([
  "account",
  "security",
  "preferences",
  "notifications",
]);

export function getSettingsSection(
  value: string | string[] | undefined,
): SettingsSection {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized && sections.has(normalized as SettingsSection)
    ? (normalized as SettingsSection)
    : "account";
}

export function getSettingsFlashMessage(query: {
  [key: string]: string | string[] | undefined;
}): SettingsFlashMessage | null {
  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const message = Array.isArray(query.message)
    ? query.message[0]
    : query.message;

  if (!message || (status !== "success" && status !== "error")) {
    return null;
  }

  return {
    status,
    message,
  };
}
