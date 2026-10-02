"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListGoogleAdsAccountsResult } from "@/types/google-ads";

async function fetchGoogleAdsAccounts(): Promise<ListGoogleAdsAccountsResult> {
  const url = "/api/bff/google-ads/accounts";
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET google-ads/accounts", { url });

  const { body } = await fetchBffJson<ListGoogleAdsAccountsResult>(url, {
    fallback: "Impossible de charger les comptes Google Ads.",
    mode: "strict",
  });

  const result: ListGoogleAdsAccountsResult = {
    requestUrl: body.requestUrl ?? "",
    accounts: Array.isArray(body.accounts) ? body.accounts : [],
    error: null,
  };

  logUnilizeEvent("browser-bff", "success", "GET google-ads/accounts", {
    durationMs: Date.now() - startedAt,
    count: result.accounts.length,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useGoogleAdsAccounts(
  options?: Omit<
    UseQueryOptions<ListGoogleAdsAccountsResult, Error>,
    "queryKey" | "queryFn"
  > & { enabled?: boolean },
) {
  return useQuery({
    queryKey: unilizeKeys.googleAdsAccounts(),
    queryFn: fetchGoogleAdsAccounts,
    enabled: options?.enabled !== false,
    ...options,
  });
}
