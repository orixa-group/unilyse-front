"use client";

import { getMetricGlossary } from "@/lib/metrics/glossary";

export function MetricHeader({
  label,
  metricId,
}: {
  label: string;
  metricId: string;
}) {
  const tip = getMetricGlossary(metricId);
  if (!tip) {
    return <>{label}</>;
  }
  return (
    <span title={tip} className="cursor-help border-b border-dotted border-muted-foreground/50">
      {label}
    </span>
  );
}
