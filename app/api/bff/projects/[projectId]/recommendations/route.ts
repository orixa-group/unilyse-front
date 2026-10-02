import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listProjectRecommendations } from "@/lib/api/unilize";
import {
  parseRecommendationsDateFromSearchParams,
  resolveRecommendationsQuery,
} from "@/lib/unilize/recommendations-query";
import { emptyProjectRecommendations } from "@/types/recommendations";
import type { ListRecommendationsResult } from "@/types/recommendations";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const searchParams = new URL(request.url).searchParams;
    const explicitDate = parseRecommendationsDateFromSearchParams(searchParams);
    const recoQuery = resolveRecommendationsQuery(
      explicitDate.date ? { recommendationAsOfDate: explicitDate.date } : {},
    );
    const requestUrl = buildUnilizeUpstreamUrl(
      API.projectRecommendations(projectId),
      { date: recoQuery.date },
    );
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../recommendations", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          projectRecommendations: emptyProjectRecommendations(),
          error: "Projet invalide.",
        } satisfies ListRecommendationsResult,
        { status: 400 },
      );
    }

    try {
      const projectRecommendations = await withRetry(
        () => listProjectRecommendations(projectId, recoQuery),
        { attempts: 3 },
      );
      const body = {
        requestUrl,
        projectId,
        projectRecommendations,
        error: null,
      } satisfies ListRecommendationsResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../recommendations", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: projectRecommendations.keywords.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../recommendations", {
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
          projectRecommendations: emptyProjectRecommendations(),
        },
        (message) => ({
          requestUrl,
          projectId,
          projectRecommendations: emptyProjectRecommendations(),
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
