import type { ReactNode } from "react";

import { cn } from "@/src/lib/cn";

type FlashTone = "success" | "error";

export function formatStoreCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function StoreFlash({
  tone,
  children,
}: Readonly<{
  tone: FlashTone;
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

export function getStoreFlashMessage(
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
