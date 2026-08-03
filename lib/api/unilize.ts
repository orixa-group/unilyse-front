import { API } from "@/lib/constants/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type {
  CreateClientPayload,
  CreateProjectPayload,
  UnilizeApiEnvelope,
  UnilizeClient,
  UnilizeKeyword,
  UnilizePeriodQuery,
  UnilizeProject,
  UnilizeProjectDetail,
} from "@/types/unilize";
import type { UnilizePerformance } from "@/types/performance";
import type { UnilizeKeywordMonitoring } from "@/types/monitoring";
import type { UnilizeSearchConsoleSite } from "@/types/sites";
import type { UnilizeStrategy } from "@/types/strategy";
import type {
  UnilizeTimeline,
  UnilizeTimelineCtrBudgetPoint,
  UnilizeTimelineFilterQuery,
  UnilizeTimelineTrafficPoint,
} from "@/types/timeline";

export const unilizeKeys = {
  all: ["unilize"] as const,
  clients: () => [...unilizeKeys.all, "clients"] as const,
  client: (id: string) => [...unilizeKeys.clients(), id] as const,
  projects: (clientId: string) =>
    [...unilizeKeys.all, "projects", "list", clientId] as const,
  project: (id: string) => [...unilizeKeys.all, "project", id] as const,
  projectDetails: (id: string) =>
    [...unilizeKeys.all, "project", "detail", id] as const,
  performances: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "performances",
      projectId,
      period?.from ?? "",
      period?.to ?? "",
    ] as const,
  strategy: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "strategy",
      projectId,
      period?.from ?? "",
      period?.to ?? "",
    ] as const,
  monitoring: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "monitoring",
      projectId,
      period?.from ?? "",
      period?.to ?? "",
    ] as const,
  timeline: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "timeline",
      projectId,
      period?.from ?? "",
      period?.to ?? "",
    ] as const,
  timelineTraffic: (projectId: string, period?: UnilizePeriodQuery) =>
    [
      ...unilizeKeys.all,
      "timeline-traffic",
      projectId,
      period?.from ?? "",
      period?.to ?? "",
    ] as const,
  timelineCtrBudget: (
    projectId: string,
    filter?: UnilizeTimelineFilterQuery,
  ) =>
    [
      ...unilizeKeys.all,
      "timeline-ctr-budget",
      projectId,
      filter?.from ?? "",
      filter?.to ?? "",
      ...(filter?.keyword ?? []),
      ...(filter?.theme ?? []).map((t) => `t:${t}`),
    ] as const,
  themes: (projectId: string) =>
    [...unilizeKeys.all, "themes", projectId] as const,
  sites: () => [...unilizeKeys.all, "sites"] as const,
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

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(API.client(id));
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
  await apiClient.delete(API.project(id));
}

export async function updateProjectKeywords(
  projectId: string,
  keywords: UnilizeKeyword[],
): Promise<UnilizeProjectDetail> {
  const res = await apiClient.put<UnilizeApiEnvelope<UnilizeProjectDetail>>(
    API.projectKeywords(projectId),
    { body: keywords },
  );
  return res.data;
}

export async function listPerformances(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizePerformance[]> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizePerformance[]>>(
    API.projectPerformances(projectId),
    { query: period },
  );
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les performances.");
  }
  return res.data;
}

export async function getStrategy(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeStrategy> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeStrategy>>(
    API.projectStrategy(projectId),
    { query: period },
  );
  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Réponse API invalide pour la stratégie.");
  }
  return res.data;
}

export async function listKeywordMonitoring(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeKeywordMonitoring[]> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeKeywordMonitoring[]>
  >(API.projectMonitoring(projectId), { query: period });
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour le monitoring.");
  }
  return res.data;
}

export async function listSearchConsoleSites(): Promise<UnilizeSearchConsoleSite[]> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeSearchConsoleSite[]>
  >(API.SITES);
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour les sites Search Console.");
  }
  return res.data;
}

export async function getTimeline(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeTimeline> {
  const res = await apiClient.get<UnilizeApiEnvelope<UnilizeTimeline>>(
    API.projectTimeline(projectId),
    { query: period },
  );
  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Réponse API invalide pour la timeline.");
  }
  return res.data;
}

export async function listTimelineTraffic(
  projectId: string,
  period?: UnilizePeriodQuery,
): Promise<UnilizeTimelineTrafficPoint[]> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeTimelineTrafficPoint[]>
  >(API.projectTimelineTraffic(projectId), { query: period });
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour le trafic timeline.");
  }
  return res.data;
}

export async function listTimelineCtrBudget(
  projectId: string,
  filter?: UnilizeTimelineFilterQuery,
): Promise<UnilizeTimelineCtrBudgetPoint[]> {
  const res = await apiClient.get<
    UnilizeApiEnvelope<UnilizeTimelineCtrBudgetPoint[]>
  >(API.projectTimelineCtrBudget(projectId), {
    query: {
      from: filter?.from,
      to: filter?.to,
      keyword: filter?.keyword,
      theme: filter?.theme,
    },
  });
  if (!Array.isArray(res?.data)) {
    throw new Error("Réponse API invalide pour CTR / budget timeline.");
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

export async function refreshProjectMetrics(
  projectId: string,
  keywords?: string[],
): Promise<void> {
  await apiClient.post(API.projectRefresh(projectId), {
    query: keywords?.length ? { keyword: keywords } : undefined,
  });
}
