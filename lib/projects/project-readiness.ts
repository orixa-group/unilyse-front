import type { UnilizeProject } from "@/types/unilize";

/** État de préparation / collecte d'un projet (calculé côté front). */
export type ProjectReadiness =
  | "setup_required"
  | "awaiting_first_sync"
  | "ready"
  | "no_data";

/** Projet considéré « récent » pour l'heuristique de première sync (48 h). */
export const RECENT_PROJECT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

/** Durée max de polling post-création avant bascule en `no_data` (30 min). */
export const SYNC_PROBE_TIMEOUT_MS = 30 * 60 * 1000;

/** Intervalle de polling des performances sur le dashboard (60 s). */
export const SYNC_PROBE_INTERVAL_MS = 60_000;

export type SetupMissingReason = "customer_id" | "keywords";

export interface ProjectReadinessInput {
  project: UnilizeProject;
  keywords: string[];
  keywordsFetched: boolean;
  hasPerformances: boolean;
  syncProbeTimedOut?: boolean;
  now?: Date;
}

export function hasCustomerId(project: UnilizeProject): boolean {
  return Boolean(project.customer_id?.trim());
}

export function getSetupMissingReasons(input: {
  project: UnilizeProject;
  keywords: string[];
}): SetupMissingReason[] {
  const missing: SetupMissingReason[] = [];
  if (!hasCustomerId(input.project)) {
    missing.push("customer_id");
  }
  if (input.keywords.length === 0) {
    missing.push("keywords");
  }
  return missing;
}

export function isProjectSetupComplete(input: {
  project: UnilizeProject;
  keywords: string[];
  keywordsFetched: boolean;
}): boolean {
  if (!input.keywordsFetched) {
    return false;
  }
  return getSetupMissingReasons(input).length === 0;
}

export function getProjectAgeMs(
  project: UnilizeProject,
  now: Date = new Date(),
): number {
  const createdAt = new Date(project.created_at).getTime();
  if (Number.isNaN(createdAt)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, now.getTime() - createdAt);
}

export function isRecentProject(
  project: UnilizeProject,
  now: Date = new Date(),
): boolean {
  return getProjectAgeMs(project, now) < RECENT_PROJECT_MAX_AGE_MS;
}

export function computeProjectReadiness(
  input: ProjectReadinessInput,
): ProjectReadiness {
  const now = input.now ?? new Date();

  if (!input.keywordsFetched) {
    return "setup_required";
  }

  if (
    !isProjectSetupComplete({
      project: input.project,
      keywords: input.keywords,
      keywordsFetched: input.keywordsFetched,
    })
  ) {
    return "setup_required";
  }

  if (input.hasPerformances) {
    return "ready";
  }

  if (input.syncProbeTimedOut || !isRecentProject(input.project, now)) {
    return "no_data";
  }

  return "awaiting_first_sync";
}

export interface ProjectReadinessMeta {
  label: string;
  description: string;
  tone: "warning" | "info" | "success" | "muted";
}

const READINESS_META: Record<ProjectReadiness, ProjectReadinessMeta> = {
  setup_required: {
    label: "Configuration requise",
    description:
      "Complétez le compte Google Ads et les mots-clés pour lancer la collecte.",
    tone: "warning",
  },
  awaiting_first_sync: {
    label: "Première synchronisation",
    description:
      "Première synchronisation en cours — cela peut prendre plusieurs minutes.",
    tone: "info",
  },
  ready: {
    label: "Prêt",
    description: "Des données de performance sont disponibles pour ce projet.",
    tone: "success",
  },
  no_data: {
    label: "Aucune donnée",
    description:
      "La configuration est complète mais aucune donnée n’a été enregistrée. Vérifiez les sources connectées.",
    tone: "muted",
  },
};

export function getProjectReadinessMeta(
  readiness: ProjectReadiness,
): ProjectReadinessMeta {
  return READINESS_META[readiness];
}

export function getSetupReasonLabel(reason: SetupMissingReason): string {
  switch (reason) {
    case "customer_id":
      return "Compte Google Ads renseigné";
    case "keywords":
      return "Mots-clés ajoutés";
  }
}
