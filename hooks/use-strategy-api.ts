"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { GetStrategyResult } from "@/types/strategy";

async function fetchStrategy(
  projectId: string,
  campaignId: string,
): Promise<GetStrategyResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/campaigns/${encodeURIComponent(campaignId)}/strategy`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET strategy", {
    projectId,
    campaignId,
    url,
  });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as GetStrategyResult;

  const result: GetStrategyResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    campaignId: body.campaignId ?? campaignId,
    strategy: body.strategy ?? null,
    error: body.error ?? null,
  };

  const strategyCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger la stratégie.",
    "empty-on-not-found",
  );
  if (!strategyCheck.ok) {
    if (strategyCheck.empty) {
      const empty = { ...result, strategy: null, error: null };
      logUnilizeEvent("browser-bff", "success", "GET strategy (vide)", {
        projectId,
        campaignId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET strategy", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: strategyCheck.message,
    });
    throw new Error(strategyCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET strategy", {
    projectId,
    campaignId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    keywords: result.strategy?.keyword_comparisons.length ?? 0,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useStrategy(
  projectId: string | null,
  campaignId: string | null,
  options?: Omit<
    UseQueryOptions<GetStrategyResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.strategy(projectId ?? "", campaignId ?? ""),
    queryFn: () => fetchStrategy(projectId!, campaignId!),
    enabled: Boolean(projectId && campaignId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
