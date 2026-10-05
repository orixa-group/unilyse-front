"use client";

import { cn } from "@/lib/utils/cn";

export function ButtonGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { id: T; label: string }[];
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div
      className="border-border bg-background inline-flex rounded-md border p-0.5"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            className={cn(
              "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
              "cursor-pointer hover:bg-primary hover:text-primary-foreground",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
