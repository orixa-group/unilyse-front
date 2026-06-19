import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listPerformances } from "@/lib/api/unilize";
import type { ListPerformancesResult } from "@/types/performance";

function getPerformancesRequestUrl(
  projectId: string,
  campaignId: string,
): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.campaignPerformances(projectId, campaignId)}`;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string; campaignId: string }>;
  },
) {
  const { projectId, campaignId } = await context.params;
  const requestUrl = getPerformancesRequestUrl(projectId, campaignId);
  const startedAt = Date.now();
  logUnilizeEvent("bff", "start", "GET /api/bff/.../performances", {
    projectId,
    campaignId,
    upstream: requestUrl,
  });

  if (!projectId?.trim() || !campaignId?.trim()) {
    return NextResponse.json(
      {
        requestUrl: "",
        projectId: projectId ?? "",
        campaignId: campaignId ?? "",
        performances: [],
        error: "Projet ou campagne invalide.",
      } satisfies ListPerformancesResult,
      { status: 400 },
    );
  }

  try {
    const performances = await withRetry(
      () => listPerformances(projectId, campaignId),
      { attempts: 3 },
    );
    const body = {
      requestUrl,
      projectId,
      campaignId,
      performances,
      error: null,
    } satisfies ListPerformancesResult;
    logUnilizeEvent("bff", "success", "GET /api/bff/.../performances", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      count: performances.length,
      response: summarizeUnilizePayload(body),
    });
    return NextResponse.json(body);
  } catch (error) {
    logUnilizeEvent("bff", "error", "GET /api/bff/.../performances", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      upstream: requestUrl,
      rawError: error instanceof Error ? error.message : String(error),
    });
    return bffRouteErrorResponse(
      error,
      {
        requestUrl,
        projectId,
        campaignId,
        performances: [] as Awaited<ReturnType<typeof listPerformances>>,
      },
      (message) => ({
        requestUrl,
        projectId,
        campaignId,
        performances: [],
        error: message,
      }),
      { treatNotFoundAsEmpty: true },
    );
  }
}
