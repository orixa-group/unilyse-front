import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listCampaigns } from "@/lib/api/unilize";
import type { ListCampaignsResult } from "@/app/(auth)/actions/unilize-action-state";

function getCampaignsRequestUrl(projectId: string): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.projectCampaigns(projectId)}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const requestUrl = getCampaignsRequestUrl(projectId);
  const startedAt = Date.now();
  logUnilizeEvent("bff", "start", "GET /api/bff/projects/.../campaigns", {
    projectId,
  });

  if (!projectId?.trim()) {
    return NextResponse.json(
      {
        requestUrl: "",
        projectId: projectId ?? "",
        campaigns: [],
        error: "Projet invalide.",
      } satisfies ListCampaignsResult,
      { status: 400 },
    );
  }

  try {
    const campaigns = await withRetry(() => listCampaigns(projectId), {
      attempts: 3,
    });
    const body = {
      requestUrl,
      projectId,
      campaigns,
      error: null,
    } satisfies ListCampaignsResult;
    logUnilizeEvent("bff", "success", "GET /api/bff/projects/.../campaigns", {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(body),
    });
    return NextResponse.json(body);
  } catch (error) {
    logUnilizeEvent("bff", "error", "GET /api/bff/projects/.../campaigns", {
      projectId,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    return bffRouteErrorResponse(
      error,
      {
        requestUrl,
        projectId,
        campaigns: [] as Awaited<ReturnType<typeof listCampaigns>>,
      },
      (message) => ({
        requestUrl,
        projectId,
        campaigns: [],
        error: message,
      }),
      { treatNotFoundAsEmpty: false },
    );
  }
}
