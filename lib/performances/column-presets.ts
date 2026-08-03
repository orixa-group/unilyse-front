import type { TableChannel } from "@/lib/ui/table-visual";
import type { UnilizePerformance } from "@/types/performance";

/** Presets colonnes (PDF Performances). */
export type PerformanceColumnPresetId = "essentiel" | "sea" | "seo";

/** CTR global dérivé : (clics SEA + SEO) / volume × 100. */
export function computeGlobalCtr(row: UnilizePerformance): number | null {
  const volume = row.search_volume?.volume;
  if (!volume || volume <= 0) {
    return null;
  }
  const seaClicks = row.sea?.clicks ?? 0;
  const seoClicks = row.seo?.clicks ?? 0;
  return ((seaClicks + seoClicks) / volume) * 100;
}

/**
 * Défaut PDF : vol., dépense SEA, clics SEA/SEO, CTR global/SEA/SEO,
 * conv. SEA, impr. SEA/SEO, % no clic, position moy. SEO.
 */
export const PERFORMANCE_ESSENTIEL_COLUMNS = [
  "search_volume",
  "spend",
  "clicks",
  "seo_clicks",
  "ctr_global",
  "ctr",
  "seo_ctr",
  "conversions",
  "impressions",
  "seo_impressions",
  "no_click_rate",
  "average_position",
] as const;

/** Preset SEA (optionnels PDF inclus). */
export const PERFORMANCE_SEA_PRESET_COLUMNS = [
  "search_volume",
  "spend",
  "clicks",
  "ctr",
  "conversions",
  "impressions",
  "cpc",
  "roas",
  "quality_score",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
  "no_click_rate",
] as const;

/** Preset SEO. */
export const PERFORMANCE_SEO_PRESET_COLUMNS = [
  "search_volume",
  "seo_clicks",
  "seo_ctr",
  "seo_impressions",
  "ctr_global",
  "no_click_rate",
  "average_position",
  "real_time_position",
  "netlinking_avg",
  "semantic_avg",
] as const;

/** @deprecated Utiliser PERFORMANCE_ESSENTIEL_COLUMNS. */
export const PERFORMANCE_SEA_COLUMNS = PERFORMANCE_ESSENTIEL_COLUMNS;

/** Colonnes basculables (hors mot-clé, toujours visible). */
export const PERFORMANCE_TOGGLEABLE_COLUMNS = [
  "search_volume",
  "no_click_rate",
  "ctr_global",
  "collection_status",
  "impressions",
  "clicks",
  "spend",
  "ctr",
  "cpc",
  "conversions",
  "roas",
  "quality_score",
  "match_type",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
  "seo_impressions",
  "seo_clicks",
  "seo_ctr",
  "average_position",
  "real_time_position",
  "netlinking_avg",
  "semantic_avg",
] as const;

export type PerformanceToggleableColumnId =
  (typeof PERFORMANCE_TOGGLEABLE_COLUMNS)[number];

export const DEFAULT_PERFORMANCE_VISIBLE_COLUMNS: readonly string[] =
  PERFORMANCE_ESSENTIEL_COLUMNS;

export const PERFORMANCE_COLUMN_PRESETS: Record<
  PerformanceColumnPresetId,
  readonly string[]
> = {
  essentiel: PERFORMANCE_ESSENTIEL_COLUMNS,
  sea: PERFORMANCE_SEA_PRESET_COLUMNS,
  seo: PERFORMANCE_SEO_PRESET_COLUMNS,
};

export const PERFORMANCE_COLUMN_PRESET_LABELS: Record<
  PerformanceColumnPresetId,
  string
> = {
  essentiel: "Essentiel",
  sea: "SEA",
  seo: "SEO",
};

export const PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  keyword: "Mot-clé",
  search_volume: "Volume rech.",
  no_click_rate: "% No clics",
  ctr_global: "CTR global",
  collection_status: "Collecte",
  impressions: "Impr. SEA",
  clicks: "Clics SEA",
  spend: "Dépense SEA",
  ctr: "CTR SEA",
  cpc: "CPC SEA",
  conversions: "Conv. SEA",
  roas: "ROAS",
  quality_score: "Quality Score",
  match_type: "Type de correspondance",
  budget_lost_impression_share: "Impr. perdues (budget)",
  rank_lost_impression_share: "Impr. perdues (rang)",
  potential_impressions_budget: "Potentiel impr. (budget)",
  potential_impressions_rank: "Potentiel impr. (rang)",
  seo_impressions: "Impr. SEO",
  seo_clicks: "Clics SEO",
  seo_ctr: "CTR SEO",
  average_position: "Position moy. SEO",
  real_time_position: "Position temps réel",
  netlinking_avg: "BAS concurrents (moy.)",
  semantic_avg: "Sémantique concurrents (moy.)",
};

export function resolvePerformanceVisibleColumns(
  stored: string[] | null | undefined,
): Set<string> {
  if (stored === null || stored === undefined) {
    return new Set(DEFAULT_PERFORMANCE_VISIBLE_COLUMNS);
  }
  return new Set(stored);
}

export function isPerformanceColumnVisible(
  columnId: string,
  visibleColumns: ReadonlySet<string>,
): boolean {
  if (columnId === "keyword") {
    return true;
  }
  return visibleColumns.has(columnId);
}

export const PERFORMANCE_COLUMN_CHANNEL: Record<string, TableChannel> = {
  keyword: "common",
  search_volume: "common",
  no_click_rate: "common",
  ctr_global: "common",
  collection_status: "common",
  impressions: "sea",
  clicks: "sea",
  spend: "sea",
  ctr: "sea",
  cpc: "sea",
  conversions: "sea",
  roas: "sea",
  quality_score: "sea",
  match_type: "sea",
  budget_lost_impression_share: "sea",
  rank_lost_impression_share: "sea",
  potential_impressions_budget: "sea",
  potential_impressions_rank: "sea",
  seo_impressions: "seo",
  seo_clicks: "seo",
  seo_ctr: "seo",
  average_position: "seo",
  real_time_position: "seo",
  netlinking_avg: "seo",
  semantic_avg: "seo",
};
