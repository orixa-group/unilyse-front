import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { getProject } from "@/lib/api/unilize";
import type { GetProjectResult } from "@/app/(auth)/actions/unilize-action-state";

function getProjectRequestUrl(projectId: string): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.project(projectId)}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  return withBffAuth(request, async () => {
    const { projectId } = await context.params;
    const requestUrl = getProjectRequestUrl(projectId);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/projects/...", { projectId });

    if (!projectId?.trim()) {
      return NextResponse.json(
        {
          requestUrl: "",
          projectId: projectId ?? "",
          project: null,
          error: "Projet invalide.",
        } satisfies GetProjectResult,
        { status: 400 },
      );
    }

    try {
      const project = await withRetry(() => getProject(projectId), {
        attempts: 3,
      });
      const body = {
        requestUrl,
        projectId,
        project,
        error: null,
      } satisfies GetProjectResult;
      logUnilizeEvent("bff", "success", "GET /api/bff/projects/...", {
        projectId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/projects/...", {
        projectId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projectId, project: null },
        (message) => ({
          requestUrl,
          projectId,
          project: null,
          error: message,
        }),
        { treatNotFoundAsEmpty: false },
      );
    }
  });
}
