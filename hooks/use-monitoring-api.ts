"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListMonitoringResult } from "@/types/monitoring";
import type { UnilizePeriodQuery } from "@/types/unilize";

function buildUrl(projectId: string, period?: UnilizePeriodQuery): string {
  const url = new URL(
    `/api/bff/projects/${encodeURIComponent(projectId)}/monitoring`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (period?.from) url.searchParams.set("from", period.from);
  if (period?.to) url.searchParams.set("to", period.to);
  return `${url.pathname}${url.search}`;
}

async function fetchMonitoring(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<ListMonitoringResult> {
  const url = buildUrl(projectId, period);
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET monitoring", { projectId, url });

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as ListMonitoringResult;

  const result: ListMonitoringResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
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
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET monitoring", {
      projectId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: monitoringCheck.message,
    });
    throw new Error(monitoringCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET monitoring", {
    projectId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    count: result.monitoring.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useMonitoring(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<ListMonitoringResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.monitoring(projectId ?? "", period),
    queryFn: () => fetchMonitoring(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
