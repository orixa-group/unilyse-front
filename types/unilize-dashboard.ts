import type { UnilizeClient, UnilizeProject } from "@/types/unilize";

export interface UnilizeDashboardPayload {
  requestUrl: string;
  clientId: string;
  client: UnilizeClient | null;
  clientError: string | null;
  rows: Array<{
    project: UnilizeProject;
    keywords: string[];
    keywordsError: string | null;
  }>;
  error: string | null;
}
