"use client";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MonitoringResultsTable } from "@/components/monitoring/monitoring-results-table";
import { MonitoringSummary } from "@/components/monitoring/monitoring-summary";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { useMonitoring } from "@/hooks/use-monitoring-api";
import { useProjectCampaignContext } from "@/hooks/use-project-campaign-context";

export function MonitoringView() {
  const { canFetchMetrics, selectedProjectId, selectedCampaignId } =
    useProjectCampaignContext();

  const {
    data: monitoringResult,
    isLoading: isMonitoringLoading,
    isError: isMonitoringError,
    error: monitoringError,
  } = useMonitoring(
    canFetchMetrics ? selectedProjectId : null,
    canFetchMetrics ? selectedCampaignId : null,
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
      <p className="text-destructive text-sm" role="alert">
        {toUserFacingApiError(monitoringError?.message, {
          fallback: "Impossible de charger le monitoring.",
        })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <MonitoringSummary rows={monitoring} />
      <MonitoringResultsTable rows={monitoring} />
    </div>
  );
}
