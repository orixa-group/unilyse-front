"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { GetStrategyResult } from "@/types/strategy";
import type { UnilizePeriodQuery } from "@/types/unilize";

function buildUrl(projectId: string, period?: UnilizePeriodQuery): string {
  const url = new URL(
    `/api/bff/projects/${encodeURIComponent(projectId)}/strategy`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (period?.from) url.searchParams.set("from", period.from);
  if (period?.to) url.searchParams.set("to", period.to);
  return `${url.pathname}${url.search}`;
}

async function fetchStrategy(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<GetStrategyResult> {
  const url = buildUrl(projectId, period);
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET strategy", { projectId, url });

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as GetStrategyResult;

  const result: GetStrategyResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
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
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET strategy", {
      projectId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: strategyCheck.message,
    });
    throw new Error(strategyCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET strategy", {
    projectId,
    durationMs: Date.now() - startedAt,
    status: response.status,
    keywords: result.strategy?.keyword_comparisons.length ?? 0,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useStrategy(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<GetStrategyResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.strategy(projectId ?? "", period),
    queryFn: () => fetchStrategy(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
