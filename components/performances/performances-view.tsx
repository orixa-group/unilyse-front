"use client";

import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { PerformanceResultsTable } from "@/components/performances/performance-results-table";
import { PerformanceSummary } from "@/components/performances/performance-summary";
import { Button } from "@/components/ui/button";
import { usePerformances } from "@/hooks/use-performances-api";
import { useMonitoring } from "@/hooks/use-monitoring-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { useRefreshProject } from "@/hooks/use-refresh-project";

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

  const refreshMutation = useRefreshProject();

  const performances = performancesResult?.performances ?? [];
  const monitoring = monitoringResult?.monitoring ?? [];

  if (isPerformancesLoading && !performancesResult) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="flex justify-end">
          <LoadingSkeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      <BffErrorAlert
        error={performancesError}
        fallback="Impossible de charger les performances."
        title="Performances indisponibles"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedProjectId || refreshMutation.isPending}
          onClick={() => {
            if (!selectedProjectId) return;
            refreshMutation.mutate({ projectId: selectedProjectId });
          }}
        >
          {refreshMutation.isPending ? "Rafraîchissement…" : "Rafraîchir"}
        </Button>
        <PerformancePeriodPicker />
      </div>
      {refreshMutation.isError ? (
        <BffErrorAlert
          error={refreshMutation.error}
          fallback="Impossible de lancer le rafraîchissement SEO."
          title="Rafraîchissement échoué"
        />
      ) : null}
      <PerformanceSummary rows={performances} monitoring={monitoring} />
      <PerformanceResultsTable rows={performances} />
    </div>
  );
}
