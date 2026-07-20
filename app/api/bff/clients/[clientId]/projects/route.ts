import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { withBffAuth } from "@/lib/api/bff-auth";
import { withRetry } from "@/lib/api/async-utils";
import { bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import { listProjects } from "@/lib/api/unilize";

function getProjectsRequestUrl(clientId: string): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.clientProjects(clientId)}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  return withBffAuth(request, async () => {
    const { clientId } = await context.params;
    const requestUrl = getProjectsRequestUrl(clientId);
    const startedAt = Date.now();
    logUnilizeEvent("bff", "start", "GET /api/bff/clients/.../projects", {
      clientId,
      upstream: requestUrl,
    });

    if (!clientId?.trim()) {
      return NextResponse.json(
        { requestUrl: "", projects: [], error: "Client invalide." },
        { status: 400 },
      );
    }

    try {
      const projects = await withRetry(() => listProjects(clientId), {
        attempts: 3,
      });
      const body = { requestUrl, projects, error: null };
      logUnilizeEvent("bff", "success", "GET /api/bff/clients/.../projects", {
        clientId,
        durationMs: Date.now() - startedAt,
        response: summarizeUnilizePayload(body),
      });
      return NextResponse.json(body);
    } catch (error) {
      logUnilizeEvent("bff", "error", "GET /api/bff/clients/.../projects", {
        clientId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return bffRouteErrorResponse(
        error,
        { requestUrl, projects: [] as Awaited<ReturnType<typeof listProjects>> },
        (message) => ({ requestUrl, projects: [], error: message }),
        { treatNotFoundAsEmpty: false },
      );
    }
  });
}
