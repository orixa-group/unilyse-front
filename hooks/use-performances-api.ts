"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import type { ListPerformancesResult } from "@/types/performance";

async function fetchPerformances(
  projectId: string,
  campaignId: string,
): Promise<ListPerformancesResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/campaigns/${encodeURIComponent(campaignId)}/performances`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET performances", {
    projectId,
    campaignId,
    url,
  });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as ListPerformancesResult;

  const result: ListPerformancesResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    campaignId: body.campaignId ?? campaignId,
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
        campaignId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET performances", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: performancesCheck.message,
    });
    throw new Error(performancesCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET performances", {
    projectId,
    campaignId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    count: result.performances.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function usePerformances(
  projectId: string | null,
  campaignId: string | null,
  options?: Omit<
    UseQueryOptions<ListPerformancesResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.performances(projectId ?? "", campaignId ?? ""),
    queryFn: () => fetchPerformances(projectId!, campaignId!),
    enabled: Boolean(projectId && campaignId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
