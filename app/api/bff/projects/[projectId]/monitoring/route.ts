import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { listKeywordMonitoring } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import {
  normalizePeriodQuery,
  parsePeriodFromSearchParams,
} from "@/lib/unilize/period-query";
import type { ListMonitoringResult } from "@/types/monitoring";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getMonitoringRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const normalized = normalizePeriodQuery(period);
  return buildUnilizeUpstreamUrl(API.projectMonitoring(projectId), {
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
    const requestUrl = getMonitoringRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../monitoring", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          monitoring: [],
          error: "Projet invalide.",
        } satisfies ListMonitoringResult,
        { status: 400 },
      );
    }

    try {
      const monitoring = await withRetry(
        () => listKeywordMonitoring(projectId, period),
        { attempts: 3 },
      );
      const body = {
        requestUrl,
        projectId,
        monitoring,
        error: null,
      } satisfies ListMonitoringResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../monitoring", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: monitoring.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../monitoring", {
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
          monitoring: [] as Awaited<ReturnType<typeof listKeywordMonitoring>>,
        },
        (message) => ({
          requestUrl,
          projectId,
          monitoring: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
