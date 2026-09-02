"use client";

import { getMetricGlossary } from "@/lib/metrics/glossary";
import { cn } from "@/lib/utils/cn";

const DEFAULT_TOOLTIP =
  "Donnée non encore disponible — non exposée par l'API sur cette période.";

export function UnavailableMetric({
  metricId,
  className,
}: {
  metricId?: string;
  className?: string;
}) {
  const tooltip = (metricId && getMetricGlossary(metricId)) || DEFAULT_TOOLTIP;

  return (
    <span
      title={tooltip}
      className={cn(
        "bg-muted/60 text-muted-foreground inline-flex cursor-help items-center rounded px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      Indispo.
    </span>
  );
}
