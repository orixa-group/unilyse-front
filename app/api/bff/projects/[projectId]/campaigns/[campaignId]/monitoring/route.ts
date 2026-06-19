import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { listKeywordMonitoring } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListMonitoringResult } from "@/types/monitoring";

function getMonitoringRequestUrl(
  projectId: string,
  campaignId: string,
): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.campaignMonitoring(projectId, campaignId)}`;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string; campaignId: string }>;
  },
) {
  const { projectId, campaignId } = await context.params;
  const requestUrl = getMonitoringRequestUrl(projectId, campaignId);
  const startedAt = Date.now();
  logUnilizeEvent("bff", "start", "GET /api/bff/.../monitoring", {
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
        monitoring: [],
        error: "Projet ou campagne invalide.",
      } satisfies ListMonitoringResult,
      { status: 400 },
    );
  }

  try {
    const monitoring = await withRetry(
      () => listKeywordMonitoring(projectId, campaignId),
      { attempts: 3 },
    );
    const body = {
      requestUrl,
      projectId,
      campaignId,
      monitoring,
      error: null,
    } satisfies ListMonitoringResult;
    logUnilizeEvent("bff", "success", "GET /api/bff/.../monitoring", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      count: monitoring.length,
      response: summarizeUnilizePayload(body),
    });
    return NextResponse.json(body);
  } catch (error) {
    logUnilizeEvent("bff", "error", "GET /api/bff/.../monitoring", {
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
        monitoring: [] as Awaited<ReturnType<typeof listKeywordMonitoring>>,
      },
      (message) => ({
        requestUrl,
        projectId,
        campaignId,
        monitoring: [],
        error: message,
      }),
      { treatNotFoundAsEmpty: true },
    );
  }
}
