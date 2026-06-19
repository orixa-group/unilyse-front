import type {
  UnilizeBasStatusCode,
  UnilizeOptimizationStatus,
} from "@/types/strategy";

const OPTIMIZED_LABEL = "Optimisé";
const UNDER_OPTIMIZED_LABEL = "Sous-optimisé";

function normalizeStatusText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function legacyBasStatusFromCode(code: UnilizeBasStatusCode): string {
  return code === "optimized" ? OPTIMIZED_LABEL : UNDER_OPTIMIZED_LABEL;
}

function statusFromString(value: string): string | null {
  const normalized = normalizeStatusText(value);

  if (
    normalized === "optimized" ||
    normalized === "optimise" ||
    (normalized.includes("optimise") && !normalized.includes("sous") && !normalized.includes("not"))
  ) {
    return OPTIMIZED_LABEL;
  }

  if (
    normalized === "not_optimized" ||
    normalized === "not-optimized" ||
    normalized === "under_optimized" ||
    normalized === "under-optimized" ||
    normalized.includes("sous-optim") ||
    normalized.includes("sous optim") ||
    normalized.includes("not optim")
  ) {
    return UNDER_OPTIMIZED_LABEL;
  }

  if (value === OPTIMIZED_LABEL || value === UNDER_OPTIMIZED_LABEL) {
    return value;
  }

  return null;
}

/** Affiche un statut API (`optimized` / `not_optimized`) en français. */
export function formatOptimizationStatus(
  value: UnilizeOptimizationStatus | string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return statusFromString(value);
}

/**
 * Affiche le BAS / score d’autorité en « Optimisé » / « Sous-optimisé ».
 * Accepte les anciennes formes numériques ou `bas_status` pour rétrocompatibilité.
 */
export function formatBasStatus(
  bas: number | string | null | undefined,
  basStatus?: UnilizeBasStatusCode | null,
): string | null {
  if (basStatus) {
    return legacyBasStatusFromCode(basStatus);
  }

  if (bas === null || bas === undefined) {
    return null;
  }

  if (typeof bas === "string") {
    return statusFromString(bas);
  }

  if (bas >= 1) {
    return OPTIMIZED_LABEL;
  }
  if (bas <= 0) {
    return UNDER_OPTIMIZED_LABEL;
  }

  return bas >= 0.5 ? OPTIMIZED_LABEL : UNDER_OPTIMIZED_LABEL;
}

export function formatAuthorityScoreLabel(
  authorityScore: UnilizeOptimizationStatus | string | null | undefined,
  legacyBas?: number | string | null,
  legacyBasStatus?: UnilizeBasStatusCode | null,
): string | null {
  return (
    formatOptimizationStatus(authorityScore) ??
    formatBasStatus(legacyBas, legacyBasStatus)
  );
}
