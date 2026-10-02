import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listClicks } from "@/lib/api/unilize";
import { parseTimelineFilterFromSearchParams } from "@/lib/unilize/period-query";
import type { ListClicksResult, UnilizeTimelineFilterQuery } from "@/types/timeline";

function getClicksRequestUrl(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): string {
  const params: Record<string, string | string[] | undefined> = {};
  if (filter?.from) params.from = filter.from;
  if (filter?.until) params.until = filter.until;
  if (filter?.keyword?.length) params.keyword = filter.keyword;
  if (filter?.theme?.length) params.theme = filter.theme;
  return buildUnilizeUpstreamUrl(API.projectClicks(projectId), params);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const filter = parseTimelineFilterFromSearchParams(
      new URL(request.url).searchParams,
    );
    const requestUrl = getClicksRequestUrl(projectId, filter);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../clicks", {
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
        } satisfies ListClicksResult,
        { status: 400 },
      );
    }

    try {
      const points = await withRetry(() => listClicks(projectId, filter), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        points,
        error: null,
      } satisfies ListClicksResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../clicks", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: points.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../clicks", {
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
