/** Synthèse Timeline (OpenAPI Timeline). */
export interface UnilizeTimelineGlobal {
  keyword_count: number;
  search_volume: number;
  ctr: number;
  no_click_count: number;
  conversions: number;
}

export interface UnilizeTimelineChannel {
  clicks: number;
  conversions: number;
  conversions_share: number;
}

export interface UnilizeTimeline {
  global: UnilizeTimelineGlobal;
  sea: UnilizeTimelineChannel;
  seo: UnilizeTimelineChannel;
}

export interface UnilizeTimelineTrafficPoint {
  date: string;
  global: { conversions: number };
  sea: { clicks: number; sessions: number; conversions: number };
  seo: { clicks: number; sessions: number; conversions: number };
}

export interface UnilizeTimelineCtrBudgetPoint {
  date: string;
  global: { ctr: number };
  sea: { clicks: number; cost: number };
  seo: { clicks: number };
}

export type UnilizeTimelineFilterQuery = {
  from?: string;
  to?: string;
  keyword?: string[];
  theme?: string[];
};

export type GetTimelineResult = {
  requestUrl: string;
  projectId: string;
  timeline: UnilizeTimeline | null;
  error: string | null;
};

export type ListTimelineTrafficResult = {
  requestUrl: string;
  projectId: string;
  points: UnilizeTimelineTrafficPoint[];
  error: string | null;
};

export type ListTimelineCtrBudgetResult = {
  requestUrl: string;
  projectId: string;
  points: UnilizeTimelineCtrBudgetPoint[];
  error: string | null;
};

export type ListThemesResult = {
  requestUrl: string;
  projectId: string;
  themes: string[];
  error: string | null;
};
