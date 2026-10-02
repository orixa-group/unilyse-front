import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listProjectKeywords } from "@/lib/api/unilize";
import type { UnilizeKeyword } from "@/types/unilize";

export type ListProjectKeywordsResult = {
  requestUrl: string;
  projectId: string;
  keywords: UnilizeKeyword[];
  error: string | null;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const requestUrl = buildUnilizeUpstreamUrl(API.projectKeywords(projectId));
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../keywords", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          keywords: [],
          error: "Projet invalide.",
        } satisfies ListProjectKeywordsResult,
        { status: 400 },
      );
    }

    try {
      const keywords = await withRetry(() => listProjectKeywords(projectId), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        keywords,
        error: null,
      } satisfies ListProjectKeywordsResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../keywords", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: keywords.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../keywords", {
        projectId,
        durationMs: Date.now() - startedAt,
        upstream: requestUrl,
        rawError: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projectId, keywords: [] },
        (message) => ({
          requestUrl,
          projectId,
          keywords: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
