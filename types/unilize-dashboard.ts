import type {
  UnilizeCampaign,
  UnilizeClient,
  UnilizeProject,
} from "./unilize";

export interface UnilizeDashboardPayload {
  requestUrl: string;
  clientId: string;
  client: UnilizeClient | null;
  clientError: string | null;
  rows: Array<{
    project: UnilizeProject;
    campaigns: UnilizeCampaign[];
    keywords: string[];
    campaignsError: string | null;
    keywordsError: string | null;
  }>;
  error: string | null;
}
