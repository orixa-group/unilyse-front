"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
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

  const { body, treatedAsEmpty } = await fetchBffJson<GetStrategyResult>(url, {
    fallback: "Impossible de charger la stratégie.",
    mode: "empty-on-not-found",
  });

  const result: GetStrategyResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    strategy: body.strategy ?? null,
    error: null,
  };

  if (treatedAsEmpty) {
    logUnilizeEvent("browser-bff", "success", "GET strategy (vide)", {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  logUnilizeEvent("browser-bff", "success", "GET strategy", {
    projectId,
    durationMs: Date.now() - startedAt,
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
