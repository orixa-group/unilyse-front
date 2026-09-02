import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { getTimeline } from "@/lib/api/unilize";
import {
  normalizePeriodQuery,
  parsePeriodFromSearchParams,
} from "@/lib/unilize/period-query";
import type { GetTimelineResult } from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getTimelineRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const normalized = normalizePeriodQuery(period);
  return buildUnilizeUpstreamUrl(API.projectTimeline(projectId), {
    from: normalized?.from,
    to: normalized?.to,
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const period = parsePeriodFromSearchParams(new URL(request.url).searchParams);
    const requestUrl = getTimelineRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../timeline", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          timeline: null,
          error: "Projet invalide.",
        } satisfies GetTimelineResult,
        { status: 400 },
      );
    }

    try {
      const timeline = await withRetry(() => getTimeline(projectId, period), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        timeline,
        error: null,
      } satisfies GetTimelineResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../timeline", {
        projectId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../timeline", {
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
          timeline: null as Awaited<ReturnType<typeof getTimeline>> | null,
        },
        (message) => ({
          requestUrl,
          projectId,
          timeline: null,
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
