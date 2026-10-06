import { API } from "@/lib/constants/api-endpoints";
import { ApiClientError, apiClient } from "@/lib/api/client";
import type {
  CreateClientPayload,
  CreateProjectPayload,
  UpdateProjectPayload,
  UnilizeApiEnvelope,
  UnilizeClient,
  UnilizeKeyword,
  UnilizePeriodQuery,
  UnilizeProject,
  UnilizeProjectDetail,
} from "@/types/unilize";
import type { UnilizePerformance } from "@/types/performance";
import type {
  UnilizeProjectRecommendations,
  UnilizeRecommendationsQuery,
} from "@/types/recommendations";
import { normalizeProjectRecommendations } from "@/lib/strategy/normalize-project-recommendations";
import type { UnilizeGoogleAdsAccount } from "@/types/google-ads";
import type { UnilizeSearchConsoleSite } from "@/types/sites";
import type {
  UnilizeClicksPoint,
  UnilizeSummary,
  UnilizeTimelineFilterQuery,
  UnilizeTrafficPoint,
} from "@/types/timeline";
import {
  normalizeTimelineFilterQuery,
  resolveEffectivePeriod,
} from "@/lib/unilize/period-query";
import { resolveRecommendationsQuery } from "@/lib/unilize/recommendations-query";

function periodKey(period?: UnilizePeriodQuery): string {
  const resolved = resolveEffectivePeriod(period);
  return `${resolved.from}:${resolved.until}`;
}

export const unilizeKeys = {
  all: ["unilize"] as const,
  clients: () => [...unilizeKeys.all, "clients"] as const,
  client: (id: string) => [...unilizeKeys.clients(), id] as const,
  projects: (clientId: string) =>
    [...unilizeKeys.all, "projects", "list", clientId] as const,
  project: (id: string) => [...unilizeKeys.all, "project", id] as const,
  projectDetails: (id: string) =>
    [...unilizeKeys.all, "project", "detail", id] as const,
  projectKeywords: (projectId: string) =>
    [...unilizeKeys.all, "keywords", projectId] as const,
  performances: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "performances",
      projectId,
      periodKey(period),
    ] as const,
  recommendations: (projectId: string, query?: UnilizeRecommendationsQuery) =>
    [
      ...unilizeKeys.all,
      "recommendations",
      projectId,
      query?.date ?? "",
    ] as const,
  summary: (projectId: string, period?: UnilizePeriodQuery) =>
    [...unilizeKeys.all, "summary", projectId, periodKey(period)] as const,
  traffic: (projectId: string, period?: UnilizePeriodQuery) =>
    [...unilizeKeys.all, "traffic", projectId, periodKey(period)] as const,
  clicks: (
    projectId: string,
    filter?: UnilizeTimelineFilterQuery,
  ) =>
    [
      ...unilizeKeys.all,
      "clicks",
      projectId,
      filter?.from ?? "",
      filter?.until ?? "",
      ...(filter?.keyword ?? []),
      ...(filter?.theme ?? []).map((t) => `t:${t}`),
    ] as const,
  themes: (projectId: string) =>
    [...unilizeKeys.all, "themes", projectId] as const,
  searchConsoleProperties: () =>
    [...unilizeKeys.all, "search-console-properties"] as const,
  googleAdsAccounts: () =>
    [...unilizeKeys.all, "google-ads-accounts"] as const,
};

export async function listClients(): Promise<UnilizeClient[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeClient[]>>(
    API.CLIENTS,
  );
  return res.data;
}

export async function getClient(id: string): Promise<UnilizeClient> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeClient>>(
    API.client(id),
  );
  return res.data;
}

export async function createClient(
  payload: CreateClientPayload,
): Promise<UnilizeClient> {
  const res = await apiClient.post<UnilizeApiEnvelope<UnilizeClient>>(
    API.CLIENTS,
    { body: payload },
  );
  return res.data;
}

async function deleteResourceIgnoringNotFound(path: string): Promise<void> {
  try {
    await apiClient.delete(path);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return;
    }
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  await deleteResourceIgnoringNotFound(API.client(id));
}

export async function listProjects(clientId: string): Promise<UnilizeProject[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeProject[]>>(
    API.clientProjects(clientId),
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour la liste des projets.");
  }
  return res.data;
}

export async function getProject(id: string): Promise<UnilizeProjectDetail> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeProjectDetail>>(
    API.project(id),
  );
  return res.data;
}

export async function createProject(
  clientId: string,
  payload: CreateProjectPayload,
): Promise<UnilizeProject> {
  const res = await apiClient.post<UnilizeApiEnvelope<UnilizeProject>>(
    API.clientProjects(clientId),
    { body: payload },
  );
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await deleteResourceIgnoringNotFound(API.project(id));
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<UnilizeProject> {
  const res = await apiClient.put<UnilizeApiEnvelope<UnilizeProject>>(
    API.project(id),
    { body: payload },
  );
  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Réponse API invalide pour la mise à jour du projet.");
  }
  return res.data;
}

export async function listProjectKeywords(
  projectId: string,
): Promise<UnilizeKeyword[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeKeyword[]>>(
    API.projectKeywords(projectId),
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les mots-clés.");
  }
  return res.data;
}

export async function updateProjectKeywords(
  projectId: string,
  keywords: UnilizeKeyword[],
): Promise<UnilizeKeyword[]> {
  const res = await apiClient.put<UnilizeApiEnvelope<UnilizeKeyword[]>>(
    API.projectKeywords(projectId),
    { body: keywords },
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour la mise à jour des mots-clés.");
  }
  return res.data;
}

export async function listPerformances(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizePerformance[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizePerformance[]>>(
    API.projectPerformances(projectId),
    { query: resolveEffectivePeriod(period) },
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les performances.");
  }
  return res.data;
}

export async function listProjectRecommendations(
  projectId: string,
  query?: UnilizeRecommendationsQuery,
): Promise<UnilizeProjectRecommendations> {
  const resolved = resolveRecommendationsQuery(
    query?.date ? { recommendationAsOfDate: query.date } : {},
  );
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeProjectRecommendations>
  >(API.projectRecommendations(projectId), {
    query: resolved.date ? { date: resolved.date } : undefined,
  });
  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Réponse API invalide pour les recommandations.");
  }
  return normalizeProjectRecommendations(res.data);
}

export async function listSearchConsoleProperties(): Promise<
  UnilizeSearchConsoleSite[]
> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeSearchConsoleSite[]>
  >(API.SEARCH_CONSOLE_PROPERTIES);
  if (!Array.isArray(res?.data)) {
    throw new Error(
      "Réponse API invalide pour les propriétés Search Console.",
    );
  }
  return res.data;
}

/** @deprecated Utiliser listSearchConsoleProperties. */
export const listSearchConsoleSites = listSearchConsoleProperties;

export async function listGoogleAdsAccounts(): Promise<
  UnilizeGoogleAdsAccount[]
> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeGoogleAdsAccount[]>
  >(API.GOOGLE_ADS_ACCOUNTS);
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les comptes Google Ads.");
  }
  return res.data;
}

export async function getSummary(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeSummary> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeSummary>>(
    API.projectSummary(projectId),
    { query: resolveEffectivePeriod(period) },
  );
  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Réponse API invalide pour la synthèse.");
  }
  return res.data;
}

export async function listTraffic(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeTrafficPoint[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeTrafficPoint[]>>(
    API.projectTraffic(projectId),
    { query: resolveEffectivePeriod(period) },
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour le trafic.");
  }
  return res.data;
}

export async function listClicks(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): Promise<UnilizeClicksPoint[]> {
  const normalized = normalizeTimelineFilterQuery(filter);
  const period = resolveEffectivePeriod(normalized);
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeClicksPoint[]>>(
    API.projectClicks(projectId),
    {
      query: {
        from: period.from,
        until: period.until,
        keyword: normalized?.keyword,
        theme: normalized?.theme,
      },
    },
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les clics.");
  }
  return res.data;
}

export async function listProjectThemes(projectId: string): Promise<string[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<string[]>>(
    API.projectThemes(projectId),
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les thématiques.");
  }
  return res.data;
}
