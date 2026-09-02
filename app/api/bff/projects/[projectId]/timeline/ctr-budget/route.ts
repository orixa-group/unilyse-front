import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listTimelineCtrBudget } from "@/lib/api/unilize";
import {
  normalizeTimelineFilterQuery,
  parseTimelineFilterFromSearchParams,
} from "@/lib/unilize/period-query";
import type {
  ListTimelineCtrBudgetResult,
  UnilizeTimelineFilterQuery,
} from "@/types/timeline";

function getCtrBudgetRequestUrl(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): string {
  const normalized = normalizeTimelineFilterQuery(filter);
  return buildUnilizeUpstreamUrl(API.projectTimelineCtrBudget(projectId), {
    from: normalized?.from,
    to: normalized?.to,
    keyword: normalized?.keyword,
    theme: normalized?.theme,
  });
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
    const requestUrl = getCtrBudgetRequestUrl(projectId, filter);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../timeline/ctr-budget", {
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
        } satisfies ListTimelineCtrBudgetResult,
        { status: 400 },
      );
    }

    try {
      const points = await withRetry(
        () => listTimelineCtrBudget(projectId, filter),
        { attempts: 3 },
      );
      const body = {
        requestUrl,
        projectId,
        points,
        error: null,
      } satisfies ListTimelineCtrBudgetResult;
      logUnilizeEvent(
        "bff",
        "success",
        "GET /api/bff/.../timeline/ctr-budget",
        {
          projectId,
          durationMs: Date.now() - startedAt,
          count: points.length,
          response: summarizeUnilizePayload(body),
        },
      );
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../timeline/ctr-budget", {
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
          points: [] as Awaited<ReturnType<typeof listTimelineCtrBudget>>,
        },
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
