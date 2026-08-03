import type {
  UnilizeClient,
  UnilizeKeyword,
  UnilizeProject,
} from "@/types/unilize";

export interface UnilizeDashboardPayload {
  requestUrl: string;
  clientId: string;
  client: UnilizeClient | null;
  clientError: string | null;
  rows: Array<{
    project: UnilizeProject;
    keywords: UnilizeKeyword[];
    keywordsError: string | null;
  }>;
  error: string | null;
}
