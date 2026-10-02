import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { getSummary } from "@/lib/api/unilize";
import {
  parsePeriodFromSearchParams,
  resolveEffectivePeriod,
} from "@/lib/unilize/period-query";
import type { GetSummaryResult } from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getSummaryRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const normalized = resolveEffectivePeriod(period);
  return buildUnilizeUpstreamUrl(API.projectSummary(projectId), normalized);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const period = parsePeriodFromSearchParams(new URL(request.url).searchParams);
    const requestUrl = getSummaryRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../summary", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          summary: null,
          error: "Projet invalide.",
        } satisfies GetSummaryResult,
        { status: 400 },
      );
    }

    try {
      const summary = await withRetry(() => getSummary(projectId, period), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        summary,
        error: null,
      } satisfies GetSummaryResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../summary", {
        projectId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../summary", {
        projectId,
        durationMs: Date.now() - startedAt,
        upstream: requestUrl,
        rawError: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projectId, summary: null },
        (message) => ({
          requestUrl,
          projectId,
          summary: null,
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
