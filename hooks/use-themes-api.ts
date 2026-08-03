"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { unilizeKeys } from "@/lib/api/unilize";
import type { ListThemesResult } from "@/types/timeline";

async function fetchThemes(projectId: string): Promise<ListThemesResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/themes`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET themes", { projectId, url });

  const { body, treatedAsEmpty } = await fetchBffJson<ListThemesResult>(url, {
    fallback: "Impossible de charger les thématiques.",
    mode: "empty-on-not-found",
  });

  const result: ListThemesResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    themes: Array.isArray(body.themes) ? body.themes : [],
    error: null,
  };

  logUnilizeEvent(
    "browser-bff",
    "success",
    treatedAsEmpty ? "GET themes (vide)" : "GET themes",
    {
      projectId,
      durationMs: Date.now() - startedAt,
      count: result.themes.length,
      response: summarizeUnilizePayload(result),
    },
  );
  return result;
}

export function useProjectThemes(
  projectId: string | null,
  options?: Omit<
    UseQueryOptions<ListThemesResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.themes(projectId ?? ""),
    queryFn: () => fetchThemes(projectId!),
    enabled: Boolean(projectId),
    ...options,
  });
}
