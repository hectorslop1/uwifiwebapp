"use client";

import { cn } from "@/src/lib/cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <div
      className={cn(
        "theme-control inline-flex flex-wrap gap-2 rounded-pill border border-white/80 bg-white/55 p-1.5 shadow-[0_14px_34px_rgba(193,196,205,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-pill px-4 py-2.5 text-body-sm transition-all duration-200",
              active
                ? "theme-control-active bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] text-ink shadow-[0_12px_26px_rgba(205,207,214,0.16)]"
                : "theme-control-muted text-ink-muted hover:bg-white/65 hover:text-ink-soft",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
