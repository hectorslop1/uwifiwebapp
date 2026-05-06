import type { ReactNode } from "react";

import { SurfacePanel } from "./surface-panel";

type Column = {
  key: string;
  label: string;
  className?: string;
  align?: "left" | "right" | "center";
};

type Row = {
  id: string;
  cells: ReactNode[];
};

type PremiumTableProps = {
  columns: Column[];
  rows: Row[];
};

function alignmentClass(align?: Column["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function PremiumTable({
  columns,
  rows,
}: Readonly<PremiumTableProps>) {
  return (
    <SurfacePanel className="overflow-hidden">
      <div className="grid gap-0">
        <div
          className="grid gap-4 border-b border-line/30 px-4 py-3 text-label-sm uppercase tracking-[0.14em] text-ink-faint"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`${alignmentClass(column.align)} ${column.className ?? ""}`}
            >
              {column.label}
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-4 border-b border-line/20 px-4 py-3 text-body-sm text-ink-soft transition-colors duration-200 hover:bg-[rgba(var(--color-surface-raised),0.54)]"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {row.cells.map((cell, index) => (
              <div
                key={`${row.id}-${columns[index]?.key ?? index}`}
                className={alignmentClass(columns[index]?.align)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </SurfacePanel>
  );
}
