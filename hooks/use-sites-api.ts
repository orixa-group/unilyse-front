"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListSitesResult } from "@/types/sites";

async function fetchSearchConsoleSites(): Promise<ListSitesResult> {
  const url = "/api/bff/sites";
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET sites", { url });

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as ListSitesResult;

  const result: ListSitesResult = {
    requestUrl: body.requestUrl ?? "",
    sites: Array.isArray(body.sites) ? body.sites : [],
    error: body.error ?? null,
  };

  const sitesCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger les sites Search Console.",
    "strict",
  );
  if (!sitesCheck.ok) {
    if (sitesCheck.empty) {
      const empty = { ...result, sites: [], error: null };
      logUnilizeEvent("browser-bff", "success", "GET sites (vide)", {
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET sites", {
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: sitesCheck.message,
    });
    throw new Error(sitesCheck.message);
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
