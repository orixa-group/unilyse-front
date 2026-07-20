import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { getStrategy } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { GetStrategyResult } from "@/types/strategy";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getStrategyRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  return buildUnilizeUpstreamUrl(API.projectStrategy(projectId), {
    from: period?.from,
    to: period?.to,
  });
}

function parsePeriod(request: Request): UnilizePeriodQuery | undefined {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() || undefined;
  const to = searchParams.get("to")?.trim() || undefined;
  if (!from && !to) return undefined;
  return { from, to };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const period = parsePeriod(request);
    const requestUrl = getStrategyRequestUrl(projectId, period);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../strategy", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          strategy: null,
          error: "Projet invalide.",
        } satisfies GetStrategyResult,
        { status: 400 },
      );
    }

    try {
      const strategy = await withRetry(() => getStrategy(projectId, period), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        strategy,
        error: null,
      } satisfies GetStrategyResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../strategy", {
        projectId,
        durationMs: Date.now() - startedAt,
        keywords: strategy.keyword_comparisons.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../strategy", {
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
          strategy: null,
        },
        (message) => ({
          requestUrl,
          projectId,
          strategy: null,
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
