import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listPerformances } from "@/lib/api/unilize";
import {
  parsePeriodFromSearchParams,
  resolveEffectivePeriod,
} from "@/lib/unilize/period-query";
import type { ListPerformancesResult } from "@/types/performance";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getPerformancesRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const normalized = resolveEffectivePeriod(period);
  return buildUnilizeUpstreamUrl(API.projectPerformances(projectId), normalized);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const period = parsePeriodFromSearchParams(new URL(request.url).searchParams);
    const requestUrl = getPerformancesRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../performances", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          performances: [],
          error: "Projet invalide.",
        } satisfies ListPerformancesResult,
        { status: 400 },
      );
    }

    try {
      const performances = await withRetry(
        () => listPerformances(projectId, period),
        { attempts: 3 },
      );
      const body = {
        requestUrl,
        projectId,
        performances,
        error: null,
      } satisfies ListPerformancesResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../performances", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: performances.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../performances", {
        projectId,
        durationMs: Date.now() - startedAt,
        upstream: requestUrl,
        rawError: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        {
          requestUrl,
          projectId,
          performances: [] as Awaited<ReturnType<typeof listPerformances>>,
        },
        (message) => ({
          requestUrl,
          projectId,
          performances: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
