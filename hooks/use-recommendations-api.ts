"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import { normalizeProjectRecommendations } from "@/lib/strategy/normalize-project-recommendations";
import {
  appendRecommendationsSearchParams,
  resolveRecommendationsQuery,
  type RecommendationDateContext,
} from "@/lib/unilize/recommendations-query";
import { emptyProjectRecommendations } from "@/types/recommendations";
import type { ListRecommendationsResult } from "@/types/recommendations";

function buildUrl(
  projectId: string,
  dateContext: RecommendationDateContext,
): string {
  const url = new URL(
    `/api/bff/projects/${encodeURIComponent(projectId)}/recommendations`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  appendRecommendationsSearchParams(
    url,
    resolveRecommendationsQuery(dateContext),
  );
  return `${url.pathname}${url.search}`;
}

async function fetchRecommendations(
  projectId: string,
  dateContext: RecommendationDateContext,
): Promise<ListRecommendationsResult> {
  const url = buildUrl(projectId, dateContext);
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET recommendations", {
    projectId,
    url,
  });

  const { body, treatedAsEmpty } = await fetchBffJson<ListRecommendationsResult>(
    url,
    {
      fallback: "Impossible de charger les recommandations.",
      mode: "empty-on-not-found",
    },
  );

  const projectRecommendations = normalizeProjectRecommendations(
    body.projectRecommendations ?? emptyProjectRecommendations(),
  );

  const result: ListRecommendationsResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    projectRecommendations,
    error: null,
  };

  if (treatedAsEmpty) {
    logUnilizeEvent("browser-bff", "success", "GET recommendations (vide)", {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  logUnilizeEvent("browser-bff", "success", "GET recommendations", {
    projectId,
    durationMs: Date.now() - startedAt,
    count: projectRecommendations.keywords.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useRecommendations(
  projectId: string | null,
  dateContext: RecommendationDateContext,
  options?: Omit<
    UseQueryOptions<ListRecommendationsResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const recoQuery = resolveRecommendationsQuery(dateContext);
  return useQuery({
    queryKey: unilizeKeys.recommendations(projectId ?? "", recoQuery),
    queryFn: () => fetchRecommendations(projectId!, dateContext),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
