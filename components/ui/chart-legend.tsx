"use client";

import type { LegendPayload } from "recharts";

export function ChartLegend({
  payload,
}: {
  payload?: ReadonlyArray<LegendPayload>;
}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <ul className="text-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-xs">
      {payload.map((entry) => (
        <li
          key={String(entry.dataKey ?? entry.value)}
          className="inline-flex items-center gap-1.5"
        >
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{
              backgroundColor: entry.color,
              opacity: entry.inactive ? 0.4 : 1,
            }}
            aria-hidden
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}
