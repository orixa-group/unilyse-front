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
 * Essentielles (ordre PDF) :
 * Vol. recherche, Dépense SEA, Clics SEA, Clics SEO, CTR global, CTR SEA,
 * CTR SEO, Conversion SEA, Impression SEA, Impression SEO, % No clics,
 * Position moyenne SEO.
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

/** Extras preset SEA (après les essentielles). */
export const PERFORMANCE_SEA_EXTRA_COLUMNS = [
  "cpc",
  "roas",
  "quality_score",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
] as const;

/**
 * Extras preset SEO (après les essentielles).
 * `netlinking_score` / `semantic_score` = scores projet (placeholders API).
 */
export const PERFORMANCE_SEO_EXTRA_COLUMNS = [
  "real_time_position",
  "netlinking_score",
  "semantic_score",
  "netlinking_avg",
  "semantic_avg",
  "semantic_max",
  "semantic_min",
] as const;

/** Preset SEA = essentielles + extras SEA. */
export const PERFORMANCE_SEA_PRESET_COLUMNS = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEA_EXTRA_COLUMNS,
] as const;

/** Preset SEO = essentielles + extras SEO. */
export const PERFORMANCE_SEO_PRESET_COLUMNS = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEO_EXTRA_COLUMNS,
] as const;

/** @deprecated Utiliser PERFORMANCE_ESSENTIEL_COLUMNS. */
export const PERFORMANCE_SEA_COLUMNS = PERFORMANCE_ESSENTIEL_COLUMNS;

/**
 * Ordre d’affichage canonique (mot-clé hors toggle).
 * Essentielles → SEA extras → SEO extras → utilitaires.
 */
export const PERFORMANCE_COLUMN_DISPLAY_ORDER = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEA_EXTRA_COLUMNS,
  ...PERFORMANCE_SEO_EXTRA_COLUMNS,
  "collection_status",
  "match_type",
] as const;

/** Colonnes basculables (hors mot-clé, toujours visible). */
export const PERFORMANCE_TOGGLEABLE_COLUMNS =
  PERFORMANCE_COLUMN_DISPLAY_ORDER;

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

export const PERFORMANCE_COLUMN_PRESET_ORDER: PerformanceColumnPresetId[] = [
  "essentiel",
  "sea",
  "seo",
];

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
  potential_impressions_budget: "Impr. potentielles (budget)",
  potential_impressions_rank: "Impr. potentielles (rang)",
  seo_impressions: "Impr. SEO",
  seo_clicks: "Clics SEO",
  seo_ctr: "CTR SEO",
  average_position: "Position moy. SEO",
  real_time_position: "Position temps réel",
  netlinking_score: "Score netlinking (Babbar)",
  semantic_score: "Score sémantique (SERPmantics)",
  netlinking_avg: "Netlinking concurrents (moy. top 5)",
  semantic_avg: "Sémantique concurrents (moy. top 5)",
  semantic_max: "Sémantique max (top 5)",
  semantic_min: "Sémantique mini (top 5)",
};

export function resolvePerformanceVisibleColumns(
  stored: string[] | null | undefined,
): Set<string> {
  return new Set(resolvePerformanceVisibleColumnIds(stored));
}

/** Liste ordonnée des colonnes visibles (hors mot-clé). */
export function resolvePerformanceVisibleColumnIds(
  stored: string[] | null | undefined,
): string[] {
  if (stored === null || stored === undefined) {
    return [...DEFAULT_PERFORMANCE_VISIBLE_COLUMNS];
  }
  return stored.filter((id) => id !== "keyword");
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

/** Preset actif si l’ensemble visible correspond exactement. */
export function matchPerformanceColumnPreset(
  visibleColumns: ReadonlySet<string>,
): PerformanceColumnPresetId | null {
  for (const presetId of PERFORMANCE_COLUMN_PRESET_ORDER) {
    const preset = PERFORMANCE_COLUMN_PRESETS[presetId];
    if (
      preset.length === visibleColumns.size &&
      preset.every((id) => visibleColumns.has(id))
    ) {
      return presetId;
    }
  }
  return null;
}

export function orderPerformanceVisibleColumns(
  visibleColumns: ReadonlySet<string>,
): string[] {
  return PERFORMANCE_COLUMN_DISPLAY_ORDER.filter((id) =>
    visibleColumns.has(id),
  );
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
  netlinking_score: "seo",
  semantic_score: "seo",
  netlinking_avg: "seo",
  semantic_avg: "seo",
  semantic_max: "seo",
  semantic_min: "seo",
};
