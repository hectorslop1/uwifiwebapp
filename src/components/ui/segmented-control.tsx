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
        "theme-tab-shell inline-flex flex-wrap gap-2 rounded-pill border border-[#e2eadf] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,250,244,0.9))] p-1.5 shadow-[0_14px_28px_rgba(214,209,199,0.1),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl",
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
              "theme-tab-item rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
              active
                ? "theme-tab-item-active border border-[#63c65d] bg-white text-[#2f9837] shadow-[0_10px_20px_rgba(177,215,172,0.18)]"
                : "border-transparent text-[#5c6467] hover:bg-white/78 hover:text-[#2f9837]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
