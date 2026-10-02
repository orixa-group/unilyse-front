"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import {
  appendPeriodSearchParams,
  normalizeTimelineFilterQuery,
} from "@/lib/unilize/period-query";
import type {
  GetSummaryResult,
  ListClicksResult,
  ListTrafficResult,
  UnilizeTimelineFilterQuery,
} from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

function buildPeriodUrl(path: string, period?: UnilizePeriodQuery): string {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  appendPeriodSearchParams(url, period);
  return `${url.pathname}${url.search}`;
}

function buildFilterUrl(
  path: string,
  filter?: UnilizeTimelineFilterQuery,
): string {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  const normalized = normalizeTimelineFilterQuery(filter);
  appendPeriodSearchParams(url, normalized);
  for (const keyword of normalized?.keyword ?? []) {
    url.searchParams.append("keyword", keyword);
  }
  for (const theme of normalized?.theme ?? []) {
    url.searchParams.append("theme", theme);
  }
  return `${url.pathname}${url.search}`;
}

async function fetchSummary(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<GetSummaryResult> {
  const url = buildPeriodUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/summary`,
    period,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET summary", { projectId, url });

  const { body, treatedAsEmpty } = await fetchBffJson<GetSummaryResult>(url, {
    fallback: "Impossible de charger la synthèse.",
    mode: "empty-on-not-found",
  });

  const result: GetSummaryResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    summary: body.summary ?? null,
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET summary (vide)" : "GET summary",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

async function fetchTraffic(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<ListTrafficResult> {
  const url = buildPeriodUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/traffic`,
    period,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET traffic", { projectId, url });

  const { body, treatedAsEmpty } = await fetchBffJson<ListTrafficResult>(url, {
    fallback: "Impossible de charger le trafic.",
    mode: "empty-on-not-found",
  });

  const result: ListTrafficResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    points: Array.isArray(body.points) ? body.points : [],
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET traffic (vide)" : "GET traffic",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      count: result.points.length,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

async function fetchClicks(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): Promise<ListClicksResult> {
  const url = buildFilterUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/clicks`,
    filter,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET clicks", { projectId, url });

  const { body, treatedAsEmpty } = await fetchBffJson<ListClicksResult>(url, {
    fallback: "Impossible de charger les clics.",
    mode: "empty-on-not-found",
  });

  const result: ListClicksResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    points: Array.isArray(body.points) ? body.points : [],
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET clicks (vide)" : "GET clicks",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      count: result.points.length,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

export function useSummary(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<GetSummaryResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.summary(projectId ?? "", period),
    queryFn: () => fetchSummary(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** @deprecated Utiliser useSummary. */
export const useTimeline = useSummary;

export function useTraffic(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<ListTrafficResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.traffic(projectId ?? "", period),
    queryFn: () => fetchTraffic(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** @deprecated Utiliser useTraffic. */
export const useTimelineTraffic = useTraffic;

export function useClicks(
  projectId: string | null,
  filter?: UnilizeTimelineFilterQuery,
  options?: Omit<
    UseQueryOptions<ListClicksResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.clicks(projectId ?? "", filter),
    queryFn: () => fetchClicks(projectId!, filter),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** @deprecated Utiliser useClicks. */
export const useTimelineCtrBudget = useClicks;
