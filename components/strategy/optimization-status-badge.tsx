import {
  formatOptimizationStatus,
  type SeoStatusKey,
} from "@/lib/strategy/format-bas";
import { optimizationStatusTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeAuthorityStatus,
  UnilizeSemanticStatus,
} from "@/types/strategy";
import { UnavailableMetric } from "@/components/ui/unavailable-metric";

function normalizeOptimizationKey(
  value:
    | UnilizeSemanticStatus
    | UnilizeAuthorityStatus
    | string
    | null
    | undefined,
): SeoStatusKey | null {
  if (value === null || value === undefined) {
    return null;
  }
  const key = String(value).toLowerCase().replace(/-/g, "_");
  if (
    key === "leader" ||
    key === "optimized" ||
    key === "to_optimize" ||
    key === "fairly_degraded" ||
    key === "degraded" ||
    key === "not_optimized"
  ) {
    return key as SeoStatusKey;
  }
  return null;
}

export function OptimizationStatusBadge({
  status,
  metricId,
}: {
  status:
    | UnilizeSemanticStatus
    | UnilizeAuthorityStatus
    | string
    | null
    | undefined;
  metricId?: string;
}) {
  const key = normalizeOptimizationKey(status);
  const label = formatOptimizationStatus(status);

  if (!key || !label) {
    return <UnavailableMetric metricId={metricId} />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        optimizationStatusTone(key),
      )}
    >
      {label}
    </span>
  );
}
