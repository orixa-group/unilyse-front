"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiClientError } from "@/lib/api/client";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import {
  API,
  UNILIZE_API_DEFAULT_URL,
} from "@/lib/constants/api-endpoints";
import {
  createClient,
  createProject,
  deleteClient,
  deleteProject,
  getClient,
  linkCampaign,
  listProjects,
  listSearchConsoleSites,
  unlinkCampaign,
  updateProjectKeywords,
} from "@/lib/api/unilize";
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
  LinkCampaignActionState,
  ListProjectsActionResult,
  UnlinkCampaignActionState,
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
});

const deleteProjectSchema = z.object({
  clientId: nonEmptyString,
  projectId: nonEmptyString,
});

const linkCampaignSchema = z.object({
  projectId: nonEmptyString,
  id: nonEmptyString,
  name: nonEmptyString,
  customer_id: nonEmptyString,
});

const unlinkCampaignSchema = z.object({
  projectId: nonEmptyString,
  campaignId: nonEmptyString,
});

const updateProjectKeywordsSchema = z.object({
  projectId: nonEmptyString,
  keywordsRaw: z.string(),
});

function parseKeywordsRaw(raw: string): string[] | { error: string } {
  const keywords = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (keywords.length === 0) {
    return { error: "Au moins un mot-clé est requis." };
  }

  const unique = new Set(keywords);
  if (unique.size !== keywords.length) {
    return { error: "Les mots-clés doivent être uniques." };
  }

  return keywords;
}

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
  const base =
    process.env.API_URL?.trim()?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
  return `${base}${path}`;
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
}

export async function listProjectsAction(
  clientId: string,
): Promise<ListProjectsActionResult> {
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
}

export async function createProjectAction(
  _prevState: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const parsed = createProjectSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    const urlIssue = parsed.error.issues.find((i) => i.path[0] === "url");
    return {
      success: false,
      error: urlIssue
        ? "Sélectionnez un site Search Console valide."
        : "Le client, le nom et l’URL du projet sont requis.",
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
}

export async function deleteProjectAction(
  _prevState: DeleteProjectActionState,
  formData: FormData,
): Promise<DeleteProjectActionState> {
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
}

export async function linkCampaignAction(
  _prevState: LinkCampaignActionState,
  formData: FormData,
): Promise<LinkCampaignActionState> {
  const parsed = linkCampaignSchema.safeParse({
    projectId: formData.get("projectId"),
    id: formData.get("id"),
    name: formData.get("name"),
    customer_id: formData.get("customer_id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Tous les champs de la campagne sont requis.",
    };
  }

  try {
    const campaign = await linkCampaign(parsed.data.projectId, {
      id: parsed.data.id,
      name: parsed.data.name,
      customer_id: parsed.data.customer_id,
    });
    revalidateDashboard();
    return {
      success: true,
      campaign,
      projectId: parsed.data.projectId,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de lier la campagne.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
}

export async function unlinkCampaignAction(
  _prevState: UnlinkCampaignActionState,
  formData: FormData,
): Promise<UnlinkCampaignActionState> {
  const parsed = unlinkCampaignSchema.safeParse({
    projectId: formData.get("projectId"),
    campaignId: formData.get("campaignId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Projet ou campagne invalide.",
    };
  }

  try {
    await unlinkCampaign(parsed.data.projectId, parsed.data.campaignId);
    revalidateDashboard();
    return {
      success: true,
      projectId: parsed.data.projectId,
      campaignId: parsed.data.campaignId,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        error: mapUnilizeActionError(
          error,
          "Impossible de délier la campagne.",
        ),
      };
    }
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
}

export async function updateProjectKeywordsAction(
  _prevState: UpdateProjectKeywordsActionState,
  formData: FormData,
): Promise<UpdateProjectKeywordsActionState> {
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
    const project = await updateProjectKeywords(
      parsed.data.projectId,
      keywordsResult,
    );
    revalidateDashboard();
    return {
      success: true,
      project,
      projectId: parsed.data.projectId,
      keywords: keywordsResult,
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
}

export async function createClientAction(
  _prevState: CreateClientActionState,
  formData: FormData,
): Promise<CreateClientActionState> {
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
}

export async function deleteClientAction(
  _prevState: DeleteClientActionState,
  formData: FormData,
): Promise<DeleteClientActionState> {
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
}
