import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { getStrategy } from "@/lib/api/unilize";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { GetStrategyResult } from "@/types/strategy";

function getStrategyRequestUrl(
  projectId: string,
  campaignId: string,
): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.campaignStrategy(projectId, campaignId)}`;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string; campaignId: string }>;
  },
) {
  const { projectId, campaignId } = await context.params;
  const requestUrl = getStrategyRequestUrl(projectId, campaignId);
  const startedAt = Date.now();
  logUnilizeEvent("bff", "start", "GET /api/bff/.../strategy", {
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
        strategy: null,
        error: "Projet ou campagne invalide.",
      } satisfies GetStrategyResult,
      { status: 400 },
    );
  }

  try {
    const strategy = await withRetry(
      () => getStrategy(projectId, campaignId),
      { attempts: 3 },
    );
    const body = {
      requestUrl,
      projectId,
      campaignId,
      strategy,
      error: null,
    } satisfies GetStrategyResult;
    logUnilizeEvent("bff", "success", "GET /api/bff/.../strategy", {
      projectId,
      campaignId,
      durationMs: Date.now() - startedAt,
      keywords: strategy.keyword_comparisons.length,
      response: summarizeUnilizePayload(body),
    });
    return NextResponse.json(body);
  } catch (error) {
    logUnilizeEvent("bff", "error", "GET /api/bff/.../strategy", {
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
        strategy: null,
      },
      (message) => ({
        requestUrl,
        projectId,
        campaignId,
        strategy: null,
        error: message,
      }),
      { treatNotFoundAsEmpty: true },
    );
  }
}
