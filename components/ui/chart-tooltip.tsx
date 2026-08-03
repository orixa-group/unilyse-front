"use client";

import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

type ChartTooltipProps = Partial<TooltipContentProps<ValueType, NameType>> & {
  valueFormatter?: (
    value: ValueType | undefined,
    name: NameType | undefined,
  ) => ReactNode;
};

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const title =
    typeof labelFormatter === "function"
      ? labelFormatter(label, payload)
      : label;

  return (
    <div className="bg-popover text-popover-foreground border-border min-w-[10rem] rounded-xl border px-3 py-2.5 shadow-lg">
      {title != null && title !== "" ? (
        <p className="mb-1.5 text-xs font-semibold">{title}</p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry) => {
          const displayValue = valueFormatter
            ? valueFormatter(entry.value, entry.name)
            : entry.value;
          return (
            <li
              key={String(entry.dataKey ?? entry.name)}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              <span className="text-popover-foreground">
                {entry.name}
                {" : "}
                <span className="font-medium tabular-nums">{displayValue}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
