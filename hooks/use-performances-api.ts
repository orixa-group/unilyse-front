"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import type { ListPerformancesResult } from "@/types/performance";
import type { UnilizePeriodQuery } from "@/types/unilize";

function buildUrl(projectId: string, period?: UnilizePeriodQuery): string {
  const url = new URL(
    `/api/bff/projects/${encodeURIComponent(projectId)}/performances`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (period?.from) url.searchParams.set("from", period.from);
  if (period?.to) url.searchParams.set("to", period.to);
  return `${url.pathname}${url.search}`;
}

async function fetchPerformances(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<ListPerformancesResult> {
  const url = buildUrl(projectId, period);
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET performances", {
    projectId,
    url,
  });

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as ListPerformancesResult;

  const result: ListPerformancesResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    performances: Array.isArray(body.performances) ? body.performances : [],
    error: body.error ?? null,
  };

  const performancesCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger les performances.",
    "empty-on-not-found",
  );
  if (!performancesCheck.ok) {
    if (performancesCheck.empty) {
      const empty = { ...result, performances: [], error: null };
      logUnilizeEvent("browser-bff", "success", "GET performances (vide)", {
        projectId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET performances", {
      projectId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: performancesCheck.message,
    });
    throw new Error(performancesCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET performances", {
    projectId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    count: result.performances.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function usePerformances(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<ListPerformancesResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.performances(projectId ?? "", period),
    queryFn: () => fetchPerformances(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
