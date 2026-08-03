import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listProjectThemes } from "@/lib/api/unilize";
import type { ListThemesResult } from "@/types/timeline";

function getThemesRequestUrl(projectId: string): string {
  return buildUnilizeUpstreamUrl(API.projectThemes(projectId));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const requestUrl = getThemesRequestUrl(projectId);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/.../themes", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          themes: [],
          error: "Projet invalide.",
        } satisfies ListThemesResult,
        { status: 400 },
      );
    }

    try {
      const themes = await withRetry(() => listProjectThemes(projectId), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        themes,
        error: null,
      } satisfies ListThemesResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/.../themes", {
        projectId,
        durationMs: Date.now() - startedAt,
        count: themes.length,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/.../themes", {
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
          themes: [] as Awaited<ReturnType<typeof listProjectThemes>>,
        },
        (message) => ({
          requestUrl,
          projectId,
          themes: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: true },
      );
    }
  });
}
