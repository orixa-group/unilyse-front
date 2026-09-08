"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAuthenticatedServerAction } from "@/lib/auth/server-action-auth";
import { ApiClientError } from "@/lib/api/client";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { API } from "@/lib/constants/api-endpoints";
import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";
import {
  createClient,
  createProject,
  deleteClient,
  deleteProject,
  getClient,
  getProject,
  listProjects,
  listSearchConsoleSites,
  updateProjectKeywords,
} from "@/lib/api/unilize";
import {
  mergeKeywordThemes,
  parseKeywordsRaw,
} from "@/lib/projects/keywords";
import {
  logUnilizeEvent,
  summarizeUnilizePayload,
} from "@/lib/unilize/request-log";
import { nonEmptyString } from "@/lib/utils/validation";
import type {
  CreateClientActionState,
  CreateProjectActionState,
  DeleteClientActionState,
  DeleteProjectActionState,
  GetClientActionResult,
  ListProjectsActionResult,
  UpdateProjectKeywordsActionState,
} from "./unilize-action-state";

const createClientSchema = z.object({
  name: nonEmptyString,
});

const deleteClientSchema = z.object({
  clientId: nonEmptyString,
});

const getClientSchema = z.object({
  clientId: nonEmptyString,
});

const listProjectsSchema = z.object({
  clientId: nonEmptyString,
});

const createProjectSchema = z.object({
  clientId: nonEmptyString,
  name: nonEmptyString,
  url: z.string().trim().min(1, "Sélectionnez un site Search Console."),
  customer_id: nonEmptyString,
  ga4_property_id: nonEmptyString,
  ctr_benchmark: z.coerce
    .number({ invalid_type_error: "Le CTR benchmark doit être un nombre." })
    .min(0, "Le CTR benchmark doit être positif ou nul.")
    .max(100, "Le CTR benchmark ne peut pas dépasser 100 %."),
});

const deleteProjectSchema = z.object({
  clientId: nonEmptyString,
  projectId: nonEmptyString,
});

const updateProjectKeywordsSchema = z.object({
  projectId: nonEmptyString,
  keywordsRaw: z.string(),
});

const AUTH_LAYOUT_PATHS = [
  "/dashboard",
  "/performances",
  "/strategie",
  "/monitoring",
] as const;

function revalidateAuthLayouts() {
  for (const path of AUTH_LAYOUT_PATHS) {
    revalidatePath(path, "layout");
  }
}

function getUnilizeRequestUrl(path: string): string {
  return buildUnilizeUpstreamUrl(path);
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
}

function mapUnilizeActionError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return toUserFacingApiError(error.message, {
      status: error.status,
      fallback,
    });
  }
  if (error instanceof Error) {
    return toUserFacingApiError(error.message, { fallback });
  }
  return fallback;
}

export async function getClientAction(
  clientId: string,
): Promise<GetClientActionResult> {
  return runAuthenticatedServerAction(async () => {
  const startedAt = Date.now();
  logUnilizeEvent("server-action", "start", "getClientAction", { clientId });

  const parsed = getClientSchema.safeParse({ clientId });

  if (!parsed.success) {
    const result = {
      requestUrl: "",
      client: null,
      error: "Client invalide.",
    };
    logUnilizeEvent("server-action", "warn", "getClientAction", {
      clientId,
      durationMs: Date.now() - startedAt,
      apiError: result.error,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  const requestUrl = getUnilizeRequestUrl(API.client(parsed.data.clientId));

  try {
    const client = await getClient(parsed.data.clientId);
    const result = { requestUrl, client, error: null };
    logUnilizeEvent("server-action", "success", "getClientAction", {
      clientId: parsed.data.clientId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  } catch (error) {
    const result = {
      requestUrl,
      client: null,
      error: mapUnilizeActionError(
        error,
        "Impossible de charger le client.",
      ),
    };
    logUnilizeEvent("server-action", "warn", "getClientAction", {
      clientId: parsed.data.clientId,
      durationMs: Date.now() - startedAt,
      apiError: result.error,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }
  }, () => ({
    requestUrl: "",
    client: null,
    error: "Non authentifié.",
  }));
}

export async function listProjectsAction(
  clientId: string,
): Promise<ListProjectsActionResult> {
  return runAuthenticatedServerAction(async () => {
  const parsed = listProjectsSchema.safeParse({ clientId });

  if (!parsed.success) {
    return {
      requestUrl: "",
      projects: [],
      error: "Client invalide.",
    };
  }

  const requestUrl = getUnilizeRequestUrl(
    API.clientProjects(parsed.data.clientId),
  );

  try {
    const projects = await listProjects(parsed.data.clientId);
    return { requestUrl, projects, error: null };
  } catch (error) {
    return {
      requestUrl,
      projects: [],
      error: mapUnilizeActionError(
        error,
        "Impossible de charger les projets.",
      ),
    };
  }
  }, () => ({
    requestUrl: "",
    projects: [],
    error: "Non authentifié.",
  }));
}

export async function createProjectAction(
  _prevState: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  return runAuthenticatedServerAction(async () => {
  const parsed = createProjectSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    url: formData.get("url"),
    customer_id: formData.get("customer_id"),
    ga4_property_id: formData.get("ga4_property_id"),
    ctr_benchmark: formData.get("ctr_benchmark"),
  });

  if (!parsed.success) {
    const urlIssue = parsed.error.issues.find((i) => i.path[0] === "url");
    const customerIssue = parsed.error.issues.find(
      (i) => i.path[0] === "customer_id",
    );
    const ga4Issue = parsed.error.issues.find(
      (i) => i.path[0] === "ga4_property_id",
    );
    const ctrIssue = parsed.error.issues.find(
      (i) => i.path[0] === "ctr_benchmark",
    );
    return {
      success: false,
      error: urlIssue
        ? "Sélectionnez un site Search Console valide."
        : customerIssue
          ? "Le Customer ID Google Ads est requis."
          : ga4Issue
            ? "L’ID de propriété GA4 est requis."
            : ctrIssue
              ? (ctrIssue.message as string)
              : "Le client, le nom, l’URL, le Customer ID, la propriété GA4 et le CTR benchmark sont requis.",
    };
  }

  try {
    const sites = await listSearchConsoleSites();
    const urlAllowed = sites.some((site) => site.url === parsed.data.url);
    if (!urlAllowed) {
      return {
        success: false,
        error:
          "L’URL du projet doit correspondre à un site de votre Google Search Console.",
      };
    }

    const project = await createProject(parsed.data.clientId, {
      name: parsed.data.name,
      url: parsed.data.url,
      customer_id: parsed.data.customer_id,
      ga4_property_id: parsed.data.ga4_property_id,
      ctr_benchmark: parsed.data.ctr_benchmark,
    });
    revalidateDashboard();
    return {
      success: true,
      project,
      clientId: parsed.data.clientId,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de créer le projet.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
  }, () => ({
    success: false,
    error: "Non authentifié.",
  }));
}

export async function deleteProjectAction(
  _prevState: DeleteProjectActionState,
  formData: FormData,
): Promise<DeleteProjectActionState> {
  return runAuthenticatedServerAction(async () => {
  const parsed = deleteProjectSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Projet ou client invalide.",
    };
  }

  try {
    await deleteProject(parsed.data.projectId);
    revalidateDashboard();
    return {
      success: true,
      deletedProjectId: parsed.data.projectId,
      clientId: parsed.data.clientId,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de supprimer le projet.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
  }, () => ({
    success: false,
    error: "Non authentifié.",
  }));
}

export async function updateProjectKeywordsAction(
  _prevState: UpdateProjectKeywordsActionState,
  formData: FormData,
): Promise<UpdateProjectKeywordsActionState> {
  return runAuthenticatedServerAction(async () => {
  const parsed = updateProjectKeywordsSchema.safeParse({
    projectId: formData.get("projectId"),
    keywordsRaw: formData.get("keywordsRaw"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Projet ou mots-clés invalides.",
    };
  }

  const keywordsResult = parseKeywordsRaw(parsed.data.keywordsRaw);
  if ("error" in keywordsResult) {
    return {
      success: false,
      error: keywordsResult.error,
    };
  }

  try {
    let existingKeywords;
    try {
      const detail = await getProject(parsed.data.projectId);
      existingKeywords = detail.keywords;
    } catch {
      existingKeywords = undefined;
    }

    const keywords = mergeKeywordThemes(keywordsResult, existingKeywords);
    const project = await updateProjectKeywords(
      parsed.data.projectId,
      keywords,
    );
    revalidateDashboard();
    return {
      success: true,
      project,
      projectId: parsed.data.projectId,
      keywords,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de mettre à jour les mots-clés.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
  }, () => ({
    success: false,
    error: "Non authentifié.",
  }));
}

export async function createClientAction(
  _prevState: CreateClientActionState,
  formData: FormData,
): Promise<CreateClientActionState> {
  return runAuthenticatedServerAction(async () => {
  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Le nom du client est requis.",
    };
  }

  try {
    const client = await createClient(parsed.data);
    revalidateAuthLayouts();
    return { success: true, client };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de créer le client.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
  }, () => ({
    success: false,
    error: "Non authentifié.",
  }));
}

export async function deleteClientAction(
  _prevState: DeleteClientActionState,
  formData: FormData,
): Promise<DeleteClientActionState> {
  return runAuthenticatedServerAction(async () => {
  const parsed = deleteClientSchema.safeParse({
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Client invalide.",
    };
  }

  try {
    await deleteClient(parsed.data.clientId);
    revalidateAuthLayouts();
    return { success: true, deletedClientId: parsed.data.clientId };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de supprimer le client.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
  }, () => ({
    success: false,
    error: "Non authentifié.",
  }));
}
