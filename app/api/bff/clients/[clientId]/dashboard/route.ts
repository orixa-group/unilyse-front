import { NextResponse } from "next/server";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import { mapWithConcurrency, withRetry } from "@/lib/api/async-utils";
import { getApiErrorMessage, bffRouteErrorResponse } from "@/lib/api/bff-route-utils";
import {
  getClient,
  getProject,
  listCampaigns,
  listProjects,
} from "@/lib/api/unilize";
import type { UnilizeDashboardPayload } from "@/types/unilize-dashboard";

export const dynamic = "force-dynamic";

/** Limite les appels parallèles vers l’API Unilize (évite des 429 / timeouts aléatoires au F5). */
const PROJECT_ROW_CONCURRENCY = 3;
const UPSTREAM_RETRY_ATTEMPTS = 3;

function getDashboardRequestUrl(clientId: string): string {
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${API.client(clientId)}/dashboard`;
}

function jsonResponse(body: UnilizeDashboardPayload, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

async function loadProjectRow(
  project: Awaited<ReturnType<typeof listProjects>>[number],
): Promise<UnilizeDashboardPayload["rows"][number]> {
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];
  let campaignsError: string | null = null;
  try {
    campaigns = await withRetry(
      () => listCampaigns(project.id),
      { attempts: UPSTREAM_RETRY_ATTEMPTS },
    );
  } catch (error) {
    campaignsError = getApiErrorMessage(error);
  }

  let keywords: string[] = [];
  let keywordsError: string | null = null;
  try {
    const detail = await withRetry(
      () => getProject(project.id),
      { attempts: UPSTREAM_RETRY_ATTEMPTS },
    );
    keywords = detail.keywords ?? [];
  } catch (error) {
    keywordsError = getApiErrorMessage(error);
  }

  return {
    project: {
      ...project,
      keywords,
    },
    campaigns,
    keywords,
    campaignsError,
    keywordsError,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await context.params;
  const requestUrl = getDashboardRequestUrl(clientId);

  if (!clientId?.trim()) {
    return jsonResponse(
      {
        requestUrl: "",
        clientId: clientId ?? "",
        client: null,
        clientError: "Client invalide.",
        rows: [],
        error: "Client invalide.",
      },
      400,
    );
  }

  try {
    const [clientSettled, projectsSettled] = await Promise.allSettled([
      withRetry(() => getClient(clientId), { attempts: UPSTREAM_RETRY_ATTEMPTS }),
      withRetry(() => listProjects(clientId), { attempts: UPSTREAM_RETRY_ATTEMPTS }),
    ]);

    let client: UnilizeDashboardPayload["client"] = null;
    let clientError: string | null = null;
    if (clientSettled.status === "fulfilled") {
      client = clientSettled.value;
    } else {
      clientError = getApiErrorMessage(clientSettled.reason);
    }

    if (projectsSettled.status === "rejected") {
      return bffRouteErrorResponse(
        projectsSettled.reason,
        {
          requestUrl,
          clientId,
          client,
          clientError,
          rows: [],
        },
        (message) => ({
          requestUrl,
          clientId,
          client,
          clientError,
          rows: [],
          error: message,
        }),
        { treatNotFoundAsEmpty: false },
      );
    }

    const projects = [...projectsSettled.value].sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );

    const rows = await mapWithConcurrency(
      projects,
      PROJECT_ROW_CONCURRENCY,
      (project) => loadProjectRow(project),
    );

    return jsonResponse({
      requestUrl,
      clientId,
      client,
      clientError,
      rows,
      error: null,
    });
  } catch (error) {
    return bffRouteErrorResponse(
      error,
      {
        requestUrl,
        clientId,
        client: null,
        clientError: null,
        rows: [],
      },
      (message) => ({
        requestUrl,
        clientId,
        client: null,
        clientError: null,
        rows: [],
        error: message,
      }),
      { treatNotFoundAsEmpty: false },
    );
  }
}
