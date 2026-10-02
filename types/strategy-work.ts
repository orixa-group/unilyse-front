/** Ligne « mot-clé à travailler » dérivée de GET /performances. */
export interface StrategyWorkGapRow {
  keyword: string;
  volume: number | null;
  current_score: number | null;
  target_score: number | null;
  gap: number | null;
  page_url: string | null;
}
