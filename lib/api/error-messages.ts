export const ELEMENT_NOT_FOUND_LABEL = "Élément introuvable.";

const EMPTY_RESOURCE_PATTERNS = [
  /sql:\s*no rows in result set/i,
  /no rows in result set/i,
  /errnorows/i,
  /record not found/i,
  /élément introuvable/i,
];

/**
 * - `empty-on-not-found`: sous-ressources (campagnes, détail projet) — pas de lignes = liste vide.
 * - `strict`: listes racine (clients, projets d’un client) — ne jamais masquer une erreur en [].
 */
export type ListFetchErrorMode = "empty-on-not-found" | "strict";

/** Erreurs backend quand une ressource ou une relation n’existe pas encore (équivalent vide). */
export function isEmptyResourceApiError(
  message: string | null | undefined,
  status?: number,
): boolean {
  if (status === 404) {
    return true;
  }
  const msg = message?.trim() ?? "";
  if (!msg) {
    return false;
  }
  if (msg === ELEMENT_NOT_FOUND_LABEL) {
    return true;
  }
  return EMPTY_RESOURCE_PATTERNS.some((pattern) => pattern.test(msg));
}

/**
 * Ne pas remplacer tout le dashboard par une alerte si des données utilisables
 * sont déjà en cache ou si l’erreur signifie simplement « vide ».
 */
export function shouldBlockDashboardView(params: {
  errorMessage: string | null | undefined;
  isFetching: boolean;
  usableItemCount: number;
}): boolean {
  const { errorMessage, isFetching, usableItemCount } = params;
  if (!errorMessage?.trim()) {
    return false;
  }
  if (isEmptyResourceApiError(errorMessage)) {
    return false;
  }
  if (usableItemCount > 0) {
    return false;
  }
  if (isFetching) {
    return false;
  }
  return true;
}

/** Erreurs PostgreSQL / driver exposées par l’API distante (non affichables telles quelles). */
export function isTechnicalDatabaseError(message: string | null | undefined): boolean {
  const msg = message?.trim() ?? "";
  if (!msg) {
    return false;
  }
  return (
    /^sql:/i.test(msg) ||
    /^pq:/i.test(msg) ||
    /^pgx:/i.test(msg) ||
    /\b(pq:|pgx:|database|syscall)\b/i.test(msg) ||
    /\b08P01\b/.test(msg) ||
    /bind message has \d+ result formats/i.test(msg)
  );
}

/** Message affichable, sans détails SQL / internes. */
export function toUserFacingApiError(
  message: string | null | undefined,
  options?: { status?: number; fallback?: string },
): string {
  const fallback = options?.fallback ?? "Une erreur est survenue.";
  const msg = message?.trim();
  if (!msg) {
    return fallback;
  }
  if (isEmptyResourceApiError(msg, options?.status)) {
    return ELEMENT_NOT_FOUND_LABEL;
  }
  if (isTechnicalDatabaseError(msg)) {
    return fallback;
  }
  return msg;
}

export function resolveListFetchError(
  message: string | null | undefined,
  status?: number,
  fallback = "Impossible de charger les données.",
  mode: ListFetchErrorMode = "empty-on-not-found",
): { shouldThrow: boolean; message: string } {
  if (mode === "strict") {
    if (!message?.trim()) {
      return { shouldThrow: true, message: fallback };
    }
    return {
      shouldThrow: true,
      message: toUserFacingApiError(message, { status, fallback }),
    };
  }

  if (isEmptyResourceApiError(message, status)) {
    return { shouldThrow: false, message: "" };
  }
  return {
    shouldThrow: true,
    message: toUserFacingApiError(message, { status, fallback }),
  };
}
