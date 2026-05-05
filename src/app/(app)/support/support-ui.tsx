import type { ReactNode } from "react";

import { cn } from "@/src/lib/cn";

export function SupportFlash({
  tone,
  children,
}: Readonly<{
  tone: "success" | "error";
  children: ReactNode;
}>) {
  return (
    <div
      className={cn(
        "rounded-[1rem] border px-4 py-3 text-[0.88rem]",
        tone === "success"
          ? "border-[#d7ebd8] bg-[#f5fff5] text-[#2f7c39]"
          : "border-[#f2d8d4] bg-[#fff7f5] text-[#b05749]",
      )}
    >
      {children}
    </div>
  );
}

export function getSupportFlashMessage(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const statusValue = searchParams.status;
  const messageValue = searchParams.message;
  const status = Array.isArray(statusValue) ? statusValue[0] : statusValue;
  const message = Array.isArray(messageValue) ? messageValue[0] : messageValue;

  if (!status || !message) {
    return null;
  }

  if (status !== "success" && status !== "error") {
    return null;
  }

  return { status, message } as const;
}

export function formatSupportDate(value?: string | null) {
  if (!value) {
    return "No date available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getSupportStatusMeta(status?: string | null) {
  const normalized = status?.trim().toLowerCase() ?? "";

  switch (normalized) {
    case "resolved":
      return { label: "Resolved", tone: "success" as const };
    case "in progress":
      return { label: "In progress", tone: "warning" as const };
    case "active":
    default:
      return { label: "Active", tone: "brand" as const };
  }
}
