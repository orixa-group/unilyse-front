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
  listProjects,
  listSearchConsoleProperties,
  updateProject,
  updateProjectKeywords,
} from "@/lib/api/unilize";
import {
  parseKeywordsJson,
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
  UpdateProjectActionState,
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

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const createProjectSchema = z.object({
  clientId: nonEmptyString,
  name: nonEmptyString,
  search_console_url: z
    .string()
    .trim()
    .min(1, "Sélectionnez une propriété Search Console."),
  gads_customer_id: nonEmptyString,
  ga4_property_id: optionalTrimmedString,
  ctr_benchmark: z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const text = String(value).trim().replace(",", ".");
      return text === "" ? undefined : text;
    },
    z.coerce
      .number({
        required_error: "Le CTR benchmark SEA est requis.",
        invalid_type_error: "Le CTR benchmark SEA doit être un nombre.",
      })
      .min(0, "Le CTR benchmark SEA ne peut pas être négatif.")
      .max(100, "Le CTR benchmark SEA ne peut pas dépasser 100 %."),
  ),
});

const updateProjectSchema = z.object({
  clientId: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  ga4_property_id: z.string().trim(),
  ctr_benchmark: z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const text = String(value).trim().replace(",", ".");
      return text === "" ? undefined : text;
    },
    z.coerce
      .number({
        required_error: "Le CTR benchmark SEA est requis.",
        invalid_type_error: "Le CTR benchmark SEA doit être un nombre.",
      })
      .gt(0, "Le CTR benchmark SEA doit être supérieur à 0 %.")
      .max(100, "Le CTR benchmark SEA ne peut pas dépasser 100 %."),
  ),
});

const deleteProjectSchema = z.object({
  clientId: nonEmptyString,
  projectId: nonEmptyString,
});

const updateProjectKeywordsSchema = z.object({
  projectId: nonEmptyString,
  keywordsJson: z.string().min(1),
});

const AUTH_LAYOUT_PATHS = [
  "/dashboard",
  "/performances",
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
    search_console_url: formData.get("search_console_url"),
    gads_customer_id: formData.get("gads_customer_id"),
    ga4_property_id: formData.get("ga4_property_id"),
    ctr_benchmark: formData.get("ctr_benchmark"),
  });

  if (!parsed.success) {
    const urlIssue = parsed.error.issues.find(
      (i) => i.path[0] === "search_console_url",
    );
    const customerIssue = parsed.error.issues.find(
      (i) => i.path[0] === "gads_customer_id",
    );
    const ctrIssue = parsed.error.issues.find(
      (i) => i.path[0] === "ctr_benchmark",
    );
    return {
      success: false,
      error: urlIssue
        ? "Sélectionnez une propriété Search Console valide."
        : customerIssue
          ? "Le compte Google Ads est requis."
          : ctrIssue
            ? (ctrIssue.message as string)
            : "Le client, le nom, la propriété Search Console, le compte Google Ads et le CTR benchmark SEA sont requis.",
    };
  }

  try {
    const sites = await listSearchConsoleProperties();
    const urlAllowed = sites.some(
      (site) => site.url === parsed.data.search_console_url,
    );
    if (!urlAllowed) {
      return {
        success: false,
        error:
          "La propriété doit correspondre à un site de votre Google Search Console.",
      };
    }

    const project = await createProject(parsed.data.clientId, {
      name: parsed.data.name,
      search_console_url: parsed.data.search_console_url,
      gads_customer_id: parsed.data.gads_customer_id,
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

export async function updateProjectAction(
  _prevState: UpdateProjectActionState,
  formData: FormData,
): Promise<UpdateProjectActionState> {
  return runAuthenticatedServerAction(async () => {
    const parsed = updateProjectSchema.safeParse({
      clientId: formData.get("clientId"),
      projectId: formData.get("projectId"),
      name: formData.get("name"),
      ga4_property_id: formData.get("ga4_property_id") ?? "",
      ctr_benchmark: formData.get("ctr_benchmark"),
    });

    if (!parsed.success) {
      const nameIssue = parsed.error.issues.find((i) => i.path[0] === "name");
      const ctrIssue = parsed.error.issues.find(
        (i) => i.path[0] === "ctr_benchmark",
      );
      return {
        success: false,
        error: nameIssue
          ? "Le nom du projet est requis."
          : ctrIssue
            ? (ctrIssue.message as string)
            : "Le nom et le CTR benchmark SEA sont requis.",
      };
    }

    try {
      const project = await updateProject(parsed.data.projectId, {
        name: parsed.data.name,
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
            "Impossible de modifier le projet.",
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
    keywordsJson: formData.get("keywordsJson"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Projet ou mots-clés invalides.",
    };
  }

  const keywordsResult = parseKeywordsJson(parsed.data.keywordsJson);
  if ("error" in keywordsResult) {
    return {
      success: false,
      error: keywordsResult.error,
    };
  }

  try {
    const keywords = await updateProjectKeywords(
      parsed.data.projectId,
      keywordsResult,
    );
    revalidateDashboard();
    return {
      success: true,
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
