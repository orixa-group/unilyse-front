"use client";

import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MonitoringResultsTable } from "@/components/monitoring/monitoring-results-table";
import { MonitoringSummary } from "@/components/monitoring/monitoring-summary";
import { useMonitoring } from "@/hooks/use-monitoring-api";
import { useProjectContext } from "@/hooks/use-project-context";

export function MonitoringView() {
  const { canFetchMetrics, selectedProjectId, period } =
    useProjectContext();

  const {
    data: monitoringResult,
    isLoading: isMonitoringLoading,
    isError: isMonitoringError,
    error: monitoringError,
  } = useMonitoring(
    canFetchMetrics ? selectedProjectId : null,
    period,
  );

  const monitoring = monitoringResult?.monitoring ?? [];

  if (isMonitoringLoading && !monitoringResult) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isMonitoringError) {
    return (
      <BffErrorAlert
        error={monitoringError}
        fallback="Impossible de charger le monitoring."
        title="Monitoring indisponible"
      />
    );
  }

  return (
    <div className="space-y-6">
      <MonitoringSummary rows={monitoring} />
      <MonitoringResultsTable rows={monitoring} />
    </div>
  );
}
