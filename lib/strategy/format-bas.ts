import type { UnilizeOptimizationStatus } from "@/types/strategy";

const OPTIMIZED_LABEL = "Optimisé";
const UNDER_OPTIMIZED_LABEL = "Sous-optimisé";

function normalizeStatusText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function statusFromString(value: string): string | null {
  const normalized = normalizeStatusText(value);

  if (
    normalized === "optimized" ||
    normalized === "optimise" ||
    (normalized.includes("optimise") &&
      !normalized.includes("sous") &&
      !normalized.includes("not"))
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

export function formatAuthorityScoreLabel(
  authorityStatus: UnilizeOptimizationStatus | string | null | undefined,
): string | null {
  return formatOptimizationStatus(authorityStatus);
}
