import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listTraffic } from "@/lib/api/unilize";
import {
  parsePeriodFromSearchParams,
  resolveEffectivePeriod,
} from "@/lib/unilize/period-query";
import type { ListTrafficResult } from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getTrafficRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const normalized = resolveEffectivePeriod(period);
  return buildUnilizeUpstreamUrl(API.projectTraffic(projectId), normalized);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const period = parsePeriodFromSearchParams(new URL(request.url).searchParams);
    const requestUrl = getTrafficRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../traffic", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          points: [],
          error: "Projet invalide.",
        } satisfies ListTrafficResult,
        { status: 400 },
      );
    }

    try {
      const points = await withRetry(() => listTraffic(projectId, period), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        points,
        error: null,
      } satisfies ListTrafficResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../traffic", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: points.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../traffic", {
        projectId,
        durationMs: Date.now() - startedAt,
        upstream: requestUrl,
        rawError: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projectId, points: [] },
        (message) => ({
          requestUrl,
          projectId,
          points: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
