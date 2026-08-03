import { NextResponse } from "next/server";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import { withBffAuth } from "@/lib/api/bff-auth";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent } from "@/lib/unilize/request-log";
import { refreshProjectMetrics } from "@/lib/api/unilize";

function getRefreshRequestUrl(
  projectId: string,
  keywords?: string[],
): string {
  return buildUnilizeUpstreamUrl(API.projectRefresh(projectId), {
    keyword: keywords,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const keywords = searchParams
      .getAll("keyword")
      .map((k) => k.trim())
      .filter(Boolean);
    const requestUrl = getRefreshRequestUrl(
      projectId,
      keywords.length ? keywords : undefined,
    );
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "POST /api/bff/.../refresh", {
      projectId,
      upstream: requestUrl,
    });

    if (!projectId?.trim()) {
      return NextResponse.json(
        { error: "Projet invalide.", requestUrl: "" },
        { status: 400 },
      );
    }

    try {
      await refreshProjectMetrics(
        projectId,
        keywords.length ? keywords : undefined,
      );
      logUnilizeEvent("bff", "success", "POST /api/bff/.../refresh", {
        projectId,
        durationMs: Date.now() - startedAt,
      });
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      logUnilizeEvent("bff", "error", "POST /api/bff/.../refresh", {
        projectId,
        durationMs: Date.now() - startedAt,
        upstream: requestUrl,
        rawError: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projectId },
        (message) => ({
          requestUrl,
          projectId,
          error: message,
        }),
      );
    }
  });
}
