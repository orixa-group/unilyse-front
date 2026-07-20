"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListSitesResult } from "@/types/sites";

async function fetchSearchConsoleSites(): Promise<ListSitesResult> {
  const url = "/api/bff/sites";
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET sites", { url });

  const { body, treatedAsEmpty } = await fetchBffJson<ListSitesResult>(url, {
    fallback: "Impossible de charger les sites Search Console.",
    mode: "strict",
  });

  const result: ListSitesResult = {
    requestUrl: body.requestUrl ?? "",
    sites: Array.isArray(body.sites) ? body.sites : [],
    error: null,
  };

  if (treatedAsEmpty) {
    logUnilizeEvent("browser-bff", "success", "GET sites (vide)", {
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  logUnilizeEvent("browser-bff", "success", "GET sites", {
    durationMs: Date.now() - startedAt,
    count: result.sites.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useSearchConsoleSites(
  options?: Omit<
    UseQueryOptions<ListSitesResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.sites(),
    queryFn: fetchSearchConsoleSites,
    staleTime: 5 * 60_000,
    ...options,
  });
}
