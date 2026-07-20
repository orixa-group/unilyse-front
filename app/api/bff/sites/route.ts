import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { listSearchConsoleSites } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListSitesResult } from "@/types/sites";

function getSitesRequestUrl(): string {
  return buildUnilizeUpstreamUrl(API.SITES);
}

export async function GET(request: Request) {
  return withBffAuth(request, async () => {
    const requestUrl = getSitesRequestUrl();
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/sites", { upstream: requestUrl });

    try {
      const sites = await withRetry(() => listSearchConsoleSites(), {
        attempts: 3,
      });
      const body: ListSitesResult = { requestUrl, sites, error: null };
      logUnilizeEvent("bff", "success", "GET /api/bff/sites", {
        durationMs: Date.now() - startedAt,
        count: sites.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/sites", {
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, sites: [] },
        (message) => ({ requestUrl, sites: [], error: message }),
        { treatNotFoundAsEmpty: false },
      );
    }
  });
}
