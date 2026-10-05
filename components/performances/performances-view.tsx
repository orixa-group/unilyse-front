"use client";

import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { PerformanceResultsTable } from "@/components/performances/performance-results-table";
import { PerformanceSummary } from "@/components/performances/performance-summary";
import { DataRefreshingOverlay } from "@/components/ui/data-refreshing-overlay";
import { usePerformances } from "@/hooks/use-performances-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { shouldShowProjectSkeleton } from "@/lib/unilize/query-loading";

export function PerformancesView() {
  const { canFetchMetrics, selectedProjectId, period } = useProjectContext();

  const {
    data: performancesResult,
    isLoading: isPerformancesLoading,
    isFetching: isPerformancesFetching,
    isError: isPerformancesError,
    error: performancesError,
  } = usePerformances(canFetchMetrics ? selectedProjectId : null, period);

  const performances = performancesResult?.performances ?? [];

  const showSkeleton = shouldShowProjectSkeleton(
    selectedProjectId,
    performancesResult,
    isPerformancesLoading,
    isPerformancesFetching,
  );
  const isRefreshing =
    isPerformancesFetching &&
    Boolean(performancesResult) &&
    performancesResult?.projectId === selectedProjectId;

  if (showSkeleton) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (isPerformancesError) {
    return (
      <BffErrorAlert
        error={performancesError}
        fallback="Impossible de charger les performances."
        title="Performances indisponibles"
      />
    );
  }

  return (
    <div className="space-y-6">
      <DataRefreshingOverlay active={isRefreshing} className="space-y-6">
        <PerformanceSummary rows={performances} />
        <PerformanceResultsTable rows={performances} />
      </DataRefreshingOverlay>
    </div>
  );
}
