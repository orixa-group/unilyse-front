import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { listGoogleAdsAccounts } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListGoogleAdsAccountsResult } from "@/types/google-ads";

export async function GET(request: Request) {
  return withBffAuth(request, async () => {
    const requestUrl = buildUnilizeUpstreamUrl(API.GOOGLE_ADS_ACCOUNTS);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/google-ads/accounts", {
      upstream: requestUrl,
    });

    try {
      const accounts = await withRetry(() => listGoogleAdsAccounts(), {
        attempts: 3,
      });
      const body: ListGoogleAdsAccountsResult = {
        requestUrl,
        accounts,
        error: null,
      };
      logUnilizeEvent("bff", "success", "GET /api/bff/google-ads/accounts", {
        durationMs: Date.now() - startedAt,
        count: accounts.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/google-ads/accounts", {
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, accounts: [] },
        (message) => ({ requestUrl, accounts: [], error: message }),
        { treatNotFoundAsEmpty: false },
      );
    }
  });
}
