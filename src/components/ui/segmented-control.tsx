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
        "theme-tab-shell inline-flex w-full max-w-full gap-2 overflow-x-auto rounded-[1.35rem] border p-1.5 backdrop-blur-xl sm:flex-wrap",
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
              "theme-tab-item inline-flex min-h-[2.85rem] shrink-0 items-center justify-center rounded-[1rem] border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
              active
                ? "theme-tab-item-active border"
                : "border-transparent",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
