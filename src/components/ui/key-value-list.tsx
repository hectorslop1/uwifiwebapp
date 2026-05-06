import type { ReactNode } from "react";

type Item = {
  label: string;
  value: ReactNode;
  tone?: "default" | "success" | "brand" | "muted" | "warning";
};

type KeyValueListProps = {
  items: Item[];
};

export function KeyValueList({ items }: Readonly<KeyValueListProps>) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const toneClass =
          item.tone === "success"
            ? "text-success"
            : item.tone === "brand"
            ? "text-brand"
            : item.tone === "warning"
            ? "text-[#996a16]"
            : item.tone === "muted"
            ? "text-ink-muted"
            : "text-ink-soft";

        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 border-b border-line/25 pb-2.5 last:border-b-0 last:pb-0"
          >
            <span className="text-label-md text-ink-muted">{item.label}</span>
            <span className={`text-body-sm font-medium ${toneClass}`}>
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
