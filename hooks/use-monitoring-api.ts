"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
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

  const { body, treatedAsEmpty } = await fetchBffJson<ListMonitoringResult>(url, {
    fallback: "Impossible de charger le monitoring.",
    mode: "empty-on-not-found",
  });

  const result: ListMonitoringResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    monitoring: Array.isArray(body.monitoring) ? body.monitoring : [],
    error: null,
  };

  if (treatedAsEmpty) {
    logUnilizeEvent("browser-bff", "success", "GET monitoring (vide)", {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  logUnilizeEvent("browser-bff", "success", "GET monitoring", {
    projectId,
    durationMs: Date.now() - startedAt,
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
