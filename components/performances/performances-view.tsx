"use client";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { PerformanceResultsTable } from "@/components/performances/performance-results-table";
import { PerformanceSummary } from "@/components/performances/performance-summary";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { usePerformances } from "@/hooks/use-performances-api";
import { useMonitoring } from "@/hooks/use-monitoring-api";
import { useProjectContext } from "@/hooks/use-project-context";

export function PerformancesView() {
  const { canFetchMetrics, selectedProjectId, period } =
    useProjectContext();

  const {
    data: performancesResult,
    isLoading: isPerformancesLoading,
    isError: isPerformancesError,
    error: performancesError,
  } = usePerformances(
    canFetchMetrics ? selectedProjectId : null,
    period,
  );

  const { data: monitoringResult } = useMonitoring(
    canFetchMetrics ? selectedProjectId : null,
    period,
  );

  const performances = performancesResult?.performances ?? [];
  const monitoring = monitoringResult?.monitoring ?? [];

  if (isPerformancesLoading && !performancesResult) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (isPerformancesError) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {toUserFacingApiError(performancesError?.message, {
          fallback: "Impossible de charger les performances.",
        })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PerformanceSummary rows={performances} monitoring={monitoring} />
      <PerformanceResultsTable rows={performances} />
    </div>
  );
}
