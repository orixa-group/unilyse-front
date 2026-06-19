"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getClientAction } from "@/app/(auth)/actions/unilize-actions";
import type {
  GetClientActionResult,
  GetProjectResult,
  ListCampaignsResult,
  ListProjectsActionResult,
} from "@/app/(auth)/actions/unilize-action-state";
import { assertBffFetchOk } from "@/lib/api/bff-fetch";
import { unilizeListQueryRetry } from "@/lib/api/retryable-error";
import {
  logUnilizeEvent,
  summarizeUnilizePayload,
} from "@/lib/unilize/request-log";
import {
  createClient,
  createProject,
  deleteClient,
  deleteProject,
  getCampaign,
  getProject,
  linkCampaign,
  listClients,
  unilizeKeys,
  unlinkCampaign,
  updateProjectKeywords,
} from "@/lib/api/unilize";
import type {
  CreateClientPayload,
  CreateProjectPayload,
  LinkCampaignPayload,
  UnilizeCampaign,
  UnilizeClient,
  UnilizeProject,
} from "@/types/unilize";

export function useClients(
  options?: Omit<
    UseQueryOptions<UnilizeClient[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.clients(),
    queryFn: listClients,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useClient(
  id: string | null,
  options?: Omit<
    UseQueryOptions<GetClientActionResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.client(id ?? ""),
    queryFn: async () => {
      const startedAt = Date.now();
      logUnilizeEvent("browser-bff", "start", "getClientAction", { clientId: id });
      try {
        const result = await getClientAction(id!);
        logUnilizeEvent(
          "browser-bff",
          result.error ? "warn" : "success",
          "getClientAction (Server Action)",
          {
            clientId: id,
            durationMs: Date.now() - startedAt,
            apiError: result.error,
            response: summarizeUnilizePayload(result),
          },
        );
        return result;
      } catch (error) {
        logUnilizeEvent("browser-bff", "error", "getClientAction (Server Action)", {
          clientId: id,
          durationMs: Date.now() - startedAt,
          message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: Boolean(id),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

async function fetchProjectsForClient(
  clientId: string,
): Promise<ListProjectsActionResult> {
  const url = `/api/bff/clients/${encodeURIComponent(clientId)}/projects`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET projects", { clientId, url });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as ListProjectsActionResult;

  const projectsCheck = assertBffFetchOk(
    response,
    body.error,
    "Impossible de charger les projets.",
    "strict",
  );
  if (!projectsCheck.ok) {
    if (projectsCheck.empty) {
      const empty = {
        requestUrl: body.requestUrl ?? "",
        projects: [],
        error: null,
      };
      logUnilizeEvent("browser-bff", "success", "GET projects (vide)", {
        clientId,
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET projects", {
      clientId,
      url,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: projectsCheck.message,
    });
    throw new Error(projectsCheck.message);
  }

  const envelope = body as ListProjectsActionResult & { data?: UnilizeProject[] };
  const projects = Array.isArray(envelope.projects)
    ? envelope.projects
    : Array.isArray(envelope.data)
      ? envelope.data
      : [];

  const result = {
    requestUrl: body.requestUrl ?? "",
    projects,
    error: null,
  };
  logUnilizeEvent("browser-bff", "success", "GET projects", {
    clientId,
    url,
    durationMs: Date.now() - startedAt,
    status: response.status,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

async function fetchProjectDetails(
  projectId: string,
): Promise<GetProjectResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET project details", { projectId, url });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as GetProjectResult;

  const result: GetProjectResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    project: body.project ?? null,
    error: body.error ?? null,
  };

  const projectCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger le projet.",
    "empty-on-not-found",
  );
  if (!projectCheck.ok) {
    if (projectCheck.empty) {
      const empty = {
        ...result,
        project: result.project ?? {
          id: projectId,
          name: "",
          created_at: "",
          updated_at: "",
          keywords: [],
        },
        error: null,
      };
      logUnilizeEvent("browser-bff", "success", "GET project details (vide)", {
        projectId,
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET project details", {
      projectId,
      url,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: projectCheck.message,
    });
    throw new Error(projectCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET project details", {
    projectId,
    url,
    durationMs: Date.now() - startedAt,
    status: response.status,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

async function fetchCampaignsForProject(
  projectId: string,
): Promise<ListCampaignsResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/campaigns`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET campaigns", { projectId, url });

  const response = await fetch(url, { cache: "no-store" });

  const body = (await response.json()) as ListCampaignsResult;

  const result: ListCampaignsResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    campaigns: Array.isArray(body.campaigns) ? body.campaigns : [],
    error: body.error ?? null,
  };

  const campaignsCheck = assertBffFetchOk(
    response,
    result.error,
    "Impossible de charger les campagnes.",
    "strict",
  );
  if (!campaignsCheck.ok) {
    if (campaignsCheck.empty) {
      const empty = { ...result, campaigns: [], error: null };
      logUnilizeEvent("browser-bff", "success", "GET campaigns (vide)", {
        projectId,
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        response: summarizeUnilizePayload(empty),
      });
      return empty;
    }
    logUnilizeEvent("browser-bff", "error", "GET campaigns", {
      projectId,
      url,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: campaignsCheck.message,
    });
    throw new Error(campaignsCheck.message);
  }

  logUnilizeEvent("browser-bff", "success", "GET campaigns", {
    projectId,
    url,
    durationMs: Date.now() - startedAt,
    status: response.status,
    response: summarizeUnilizePayload(result),
  });
  return result;
}

export function useProjects(
  clientId: string | null,
  options?: Omit<
    UseQueryOptions<ListProjectsActionResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.projects(clientId ?? ""),
    queryFn: () => fetchProjectsForClient(clientId!),
    enabled: Boolean(clientId),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...unilizeListQueryRetry,
    ...options,
  });
}

export function useProjectsCampaigns(
  projectIds: string[],
  options?: { enabled?: boolean },
) {
  const queriesEnabled = options?.enabled !== false;
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: unilizeKeys.campaigns(projectId),
      queryFn: () => fetchCampaignsForProject(projectId),
      enabled: queriesEnabled && Boolean(projectId),
      staleTime: 30_000,
      placeholderData: keepPreviousData,
      ...unilizeListQueryRetry,
    })),
  });
}

export function useProjectsDetails(
  projectIds: string[],
  options?: { enabled?: boolean },
) {
  const queriesEnabled = options?.enabled !== false;
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: unilizeKeys.projectDetails(projectId),
      queryFn: () => fetchProjectDetails(projectId),
      enabled: queriesEnabled && Boolean(projectId),
      staleTime: 30_000,
      placeholderData: keepPreviousData,
      ...unilizeListQueryRetry,
    })),
  });
}

export function useProject(
  id: string | null,
  options?: Omit<
    UseQueryOptions<UnilizeProject, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.project(id ?? ""),
    queryFn: () => getProject(id!),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCampaigns(
  projectId: string | null,
  options?: Omit<
    UseQueryOptions<ListCampaignsResult, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.campaigns(projectId ?? ""),
    queryFn: () => fetchCampaignsForProject(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...unilizeListQueryRetry,
    ...options,
  });
}

export function useCampaign(
  projectId: string | null,
  campaignId: string | null,
  options?: Omit<
    UseQueryOptions<UnilizeCampaign, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: unilizeKeys.campaign(projectId ?? "", campaignId ?? ""),
    queryFn: () => getCampaign(projectId!, campaignId!),
    enabled: Boolean(projectId && campaignId),
    ...options,
  });
}

export function useCreateClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: unilizeKeys.clients() });
    },
  });
}

export function useDeleteClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: unilizeKeys.all });
    },
  });
}

export function useCreateProjectMutation(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      createProject(clientId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: unilizeKeys.projects(clientId),
      });
      void qc.invalidateQueries({ queryKey: unilizeKeys.clients() });
    },
  });
}

export function useDeleteProjectMutation(clientId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: unilizeKeys.all });
      if (clientId) {
        void qc.invalidateQueries({
          queryKey: unilizeKeys.projects(clientId),
        });
      }
    },
  });
}

export function useUpdateProjectKeywordsMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keywords: string[]) =>
      updateProjectKeywords(projectId, keywords),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: unilizeKeys.project(projectId),
      });
      void qc.invalidateQueries({
        queryKey: unilizeKeys.projectDetails(projectId),
      });
      void qc.invalidateQueries({ queryKey: unilizeKeys.all });
    },
  });
}

export function useLinkCampaignMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LinkCampaignPayload) =>
      linkCampaign(projectId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: unilizeKeys.campaigns(projectId),
      });
    },
  });
}

export function useUnlinkCampaignMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => unlinkCampaign(projectId, campaignId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: unilizeKeys.campaigns(projectId),
      });
    },
  });
}
