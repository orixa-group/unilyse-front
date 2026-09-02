import {
  formatOptimizationStatus,
} from "@/lib/strategy/format-bas";
import { optimizationStatusTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeOptimizationStatus } from "@/types/strategy";
import { UnavailableMetric } from "@/components/ui/unavailable-metric";

function normalizeOptimizationKey(
  value: UnilizeOptimizationStatus | string | null | undefined,
): "optimized" | "not_optimized" | null {
  if (value === "optimized" || value === "not_optimized") {
    return value;
  }
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).toLowerCase().replace(/-/g, "_");
  if (normalized === "optimized") {
    return "optimized";
  }
  if (
    normalized === "not_optimized" ||
    normalized === "under_optimized"
  ) {
    return "not_optimized";
  }
  return null;
}

export function OptimizationStatusBadge({
  status,
  metricId,
}: {
  status: UnilizeOptimizationStatus | string | null | undefined;
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
