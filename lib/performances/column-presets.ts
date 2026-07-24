/** Colonnes Google Ads affichées par défaut sur Performances. */
export const PERFORMANCE_SEA_COLUMNS = [
  "keyword",
  "search_volume",
  "impressions",
  "clicks",
  "spend",
  "ctr",
  "cpc",
  "conversions",
  "roas",
  "quality_score",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
] as const;

/** Colonnes basculables (hors mot-clé, toujours visible). */
export const PERFORMANCE_TOGGLEABLE_COLUMNS = [
  "search_volume",
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
] as const;

export type PerformanceToggleableColumnId =
  (typeof PERFORMANCE_TOGGLEABLE_COLUMNS)[number];

/** Défaut = colonnes essentielles (sans match_type). */
export const DEFAULT_PERFORMANCE_VISIBLE_COLUMNS: readonly string[] =
  PERFORMANCE_SEA_COLUMNS.filter((id) => id !== "keyword");

export const PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  keyword: "Mot-clé",
  search_volume: "Volume rech.",
  impressions: "Impr. SEA",
  clicks: "Clics SEA",
  spend: "Dépense SEA",
  ctr: "CTR SEA",
  cpc: "CPC SEA",
  conversions: "Conversions",
  roas: "ROAS",
  quality_score: "Quality Score",
  match_type: "Type de correspondance",
  budget_lost_impression_share: "Impr. perdues (budget)",
  rank_lost_impression_share: "Impr. perdues (rang)",
  potential_impressions_budget: "Potentiel impr. (budget)",
  potential_impressions_rank: "Potentiel impr. (rang)",
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

export const PERFORMANCE_COLUMN_CHANNEL: Record<string, "common" | "sea"> = {
  keyword: "common",
  search_volume: "common",
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
};
