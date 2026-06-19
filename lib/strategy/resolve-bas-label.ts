import {
  formatAuthorityScoreLabel,
  formatOptimizationStatus,
} from "@/lib/strategy/format-bas";
import type { UnilizePerformance } from "@/types/performance";
import type { UnilizeStrategySeo } from "@/types/strategy";

/** Libellé BAS pour une ligne performances (API SEO ou fusion stratégie). */
export function resolvePerformanceBasLabel(
  row: UnilizePerformance,
  authorityByKeyword?: ReadonlyMap<string, string>,
): string | null {
  const fromSeo = formatAuthorityScoreLabel(
    row.seo?.authority_score,
    row.seo?.bas,
    row.seo?.bas_status,
  );
  if (fromSeo) {
    return fromSeo;
  }
  return authorityByKeyword?.get(row.keyword) ?? null;
}

export function resolveStrategyAuthorityLabel(
  seo: UnilizeStrategySeo | null | undefined,
): string | null {
  if (!seo) {
    return null;
  }
  return formatAuthorityScoreLabel(seo.authority_score);
}

export function resolveStrategySemanticLabel(
  seo: UnilizeStrategySeo | null | undefined,
): string | null {
  if (!seo) {
    return null;
  }
  return formatOptimizationStatus(seo.semantic_score);
}
