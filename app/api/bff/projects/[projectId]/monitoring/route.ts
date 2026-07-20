import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { listKeywordMonitoring } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListMonitoringResult } from "@/types/monitoring";
import type { UnilizePeriodQuery } from "@/types/unilize";

function getMonitoringRequestUrl(
  projectId: string,
  period?: UnilizePeriodQuery,
): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  const url = new URL(`${base}${API.projectMonitoring(projectId)}`);
  if (period?.from) url.searchParams.set("from", period.from);
  if (period?.to) url.searchParams.set("to", period.to);
  return url.toString();
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
