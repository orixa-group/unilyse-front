"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import type {
  GetTimelineResult,
  ListTimelineCtrBudgetResult,
  ListTimelineTrafficResult,
  UnilizeTimelineFilterQuery,
} from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

function buildPeriodUrl(
  path: string,
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (period?.from) url.searchParams.set("from", period.from);
  if (period?.to) url.searchParams.set("to", period.to);
  return `${url.pathname}${url.search}`;
}

function buildFilterUrl(
  path: string,
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): string {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (filter?.from) url.searchParams.set("from", filter.from);
  if (filter?.to) url.searchParams.set("to", filter.to);
  for (const keyword of filter?.keyword ?? []) {
    url.searchParams.append("keyword", keyword);
  }
  for (const theme of filter?.theme ?? []) {
    url.searchParams.append("theme", theme);
  }
  return `${url.pathname}${url.search}`;
}

async function fetchTimeline(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<GetTimelineResult> {
  const url = buildPeriodUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/timeline`,
    projectId,
    period,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET timeline", { projectId, url });

  const { body, treatedAsEmpty } = await fetchBffJson<GetTimelineResult>(url, {
    fallback: "Impossible de charger la timeline.",
    mode: "empty-on-not-found",
  });

  const result: GetTimelineResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    timeline: body.timeline ?? null,
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET timeline (vide)" : "GET timeline",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

async function fetchTimelineTraffic(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<ListTimelineTrafficResult> {
  const url = buildPeriodUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/timeline/traffic`,
    projectId,
    period,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET timeline/traffic", {
    projectId,
    url,
  });

  const { body, treatedAsEmpty } =
    await fetchBffJson<ListTimelineTrafficResult>(url, {
      fallback: "Impossible de charger le trafic timeline.",
      mode: "empty-on-not-found",
    });

  const result: ListTimelineTrafficResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    points: Array.isArray(body.points) ? body.points : [],
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET timeline/traffic (vide)" : "GET timeline/traffic",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      count: result.points.length,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

async function fetchTimelineCtrBudget(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): Promise<ListTimelineCtrBudgetResult> {
  const url = buildFilterUrl(
    `/api/bff/projects/${encodeURIComponent(projectId)}/timeline/ctr-budget`,
    projectId,
    filter,
  );
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET timeline/ctr-budget", {
    projectId,
    url,
  });

  const { body, treatedAsEmpty } =
    await fetchBffJson<ListTimelineCtrBudgetResult>(url, {
      fallback: "Impossible de charger CTR / budget timeline.",
      mode: "empty-on-not-found",
    });

  const result: ListTimelineCtrBudgetResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    points: Array.isArray(body.points) ? body.points : [],
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty
      ? "GET timeline/ctr-budget (vide)"
      : "GET timeline/ctr-budget",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      count: result.points.length,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

export function useTimeline(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<GetTimelineResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.timeline(projectId ?? "", period),
    queryFn: () => fetchTimeline(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useTimelineTraffic(
  projectId: string | null,
  period?: UnilizePeriodQuery,
  options?: Omit<
    UseQueryOptions<ListTimelineTrafficResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.timelineTraffic(projectId ?? "", period),
    queryFn: () => fetchTimelineTraffic(projectId!, period),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useTimelineCtrBudget(
  projectId: string | null,
  filter?: UnilizeTimelineFilterQuery,
  options?: Omit<
    UseQueryOptions<ListTimelineCtrBudgetResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.timelineCtrBudget(projectId ?? "", filter),
    queryFn: () => fetchTimelineCtrBudget(projectId!, filter),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
