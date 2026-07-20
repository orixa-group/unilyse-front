import { API } from "@/lib/constants/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type {
  CreateClientPayload,
  CreateProjectPayload,
  UnilizeApiEnvelope,
  UnilizeClient,
  UnilizePeriodQuery,
  UnilizeProject,
  UnilizeProjectDetail,
} from "@/types/unilize";
import type { UnilizePerformance } from "@/types/performance";
import type { UnilizeKeywordMonitoring } from "@/types/monitoring";
import type { UnilizeSearchConsoleSite } from "@/types/sites";
import type { UnilizeStrategy } from "@/types/strategy";

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
  keywords: string[],
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
