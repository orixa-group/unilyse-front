import type {
  UnilizeAuthorityStatus,
  UnilizeSemanticStatus,
} from "@/types/strategy";

const SEO_STATUS_LABELS: Record<
  UnilizeSemanticStatus | UnilizeAuthorityStatus | "not_optimized",
  string
> = {
  leader: "Leader",
  optimized: "Optimisé",
  to_optimize: "À optimiser",
  fairly_degraded: "Plutôt dégradé",
  degraded: "Dégradé",
  not_optimized: "À optimiser",
};

export type SeoStatusKey = keyof typeof SEO_STATUS_LABELS;

function normalizeSeoStatusKey(
  value: string,
): SeoStatusKey | null {
  const key = value.toLowerCase().replace(/-/g, "_");
  if (key in SEO_STATUS_LABELS) {
    return key as SeoStatusKey;
  }
  return null;
}

/** Affiche un statut sémantique ou autorité SEO en français. */
export function formatOptimizationStatus(
  value:
    | UnilizeSemanticStatus
    | UnilizeAuthorityStatus
    | string
    | null
    | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const key = normalizeSeoStatusKey(String(value));
  if (!key) {
    return null;
  }
  return SEO_STATUS_LABELS[key];
}

export function formatAuthorityScoreLabel(
  authorityStatus:
    | UnilizeAuthorityStatus
    | string
    | null
    | undefined,
): string | null {
  return formatOptimizationStatus(authorityStatus);
}
