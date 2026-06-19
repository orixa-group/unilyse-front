/** Recommandation de positionnement concurrentiel (OpenAPI KeywordMonitoring). */
export type UnilizeMonitoringStatus = "target" | "consider" | "ignore";

export interface UnilizeKeywordMonitoring {
  keyword: string;
  search_volume: number;
  competitor_count: number;
  status: UnilizeMonitoringStatus;
}

export type ListMonitoringResult = {
  requestUrl: string;
  projectId: string;
  campaignId: string;
  monitoring: UnilizeKeywordMonitoring[];
  error: string | null;
};
