"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListMonitoringResult } from "@/types/monitoring";

async function fetchMonitoring(
  projectId: string,
  campaignId: string,
): Promise<ListMonitoringResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/campaigns/${encodeURIComponent(campaignId)}/monitoring`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET monitoring", {
    projectId,
    campaignId,
    url,
  });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as ListMonitoringResult;

  const result: ListMonitoringResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    campaignId: body.campaignId ?? campaignId,
    monitoring: Array.isArray(body.monitoring) ? body.monitoring : [],
    error: body.error ?? null,
  };

  const monitoringCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger le monitoring.",
    "empty-on-not-found",
  );
  if (!monitoringCheck.ok) {
    if (monitoringCheck.empty) {
      const empty = { ...result, monitoring: [], error: null };
      logUnilizeEvent("browser-bff", "success", "GET monitoring (vide)", {
        projectId,
        campaignId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET monitoring", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: monitoringCheck.message,
    });
    throw new Error(monitoringCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET monitoring", {
    projectId,
    campaignId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    count: result.monitoring.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useMonitoring(
  projectId: string | null,
  campaignId: string | null,
  options?: Omit<
    UseQueryOptions<ListMonitoringResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.monitoring(projectId ?? "", campaignId ?? ""),
    queryFn: () => fetchMonitoring(projectId!, campaignId!),
    enabled: Boolean(projectId && campaignId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
