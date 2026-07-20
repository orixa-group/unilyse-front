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
  ListProjectsActionResult,
} from "@/app/(auth)/actions/unilize-action-state";
import { fetchBffJson } from "@/lib/api/bff-fetch";
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
  getProject,
  listClients,
  unilizeKeys,
  updateProjectKeywords,
} from "@/lib/api/unilize";
import type {
  CreateClientPayload,
  CreateProjectPayload,
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

  const { body, treatedAsEmpty } =
    await fetchBffJson<ListProjectsActionResult>(url, {
      fallback: "Impossible de charger les projets.",
      mode: "strict",
    });

  if (treatedAsEmpty) {
    const empty = {
      requestUrl: body.requestUrl ?? "",
      projects: [],
      error: null,
    };
    logUnilizeEvent("browser-bff", "success", "GET projects (vide)", {
      clientId,
      url,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(empty),
    });
    return empty;
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

  const { body, treatedAsEmpty } = await fetchBffJson<GetProjectResult>(url, {
    fallback: "Impossible de charger le projet.",
    mode: "empty-on-not-found",
  });

  const result: GetProjectResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    project: body.project ?? null,
    error: null,
  };

  if (treatedAsEmpty) {
    const empty = {
      ...result,
      project: result.project ?? {
        id: projectId,
        name: "",
        url: "",
        customer_id: "",
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
      response: summarizeUnilizePayload(empty),
    });
    return empty;
  }

  logUnilizeEvent("browser-bff", "success", "GET project details", {
    projectId,
    url,
    durationMs: Date.now() - startedAt,
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

