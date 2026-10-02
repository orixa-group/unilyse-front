/** Synthèse projet (OpenAPI Summary). */
export interface UnilizeSummaryGlobal {
  keyword_count: number;
  search_volume: number;
  /** Fraction 0–1. */
  ctr: number;
  no_clicks: number;
  conversions: number;
}

export interface UnilizeSummaryChannel {
  clicks: number;
  conversions: number;
  /** Fraction 0–1. */
  conversion_share: number;
}

export interface UnilizeSummary {
  global: UnilizeSummaryGlobal;
  paid: UnilizeSummaryChannel;
  organic: UnilizeSummaryChannel;
}

export interface UnilizeTrafficPoint {
  date: string;
  global: { sessions: number; conversions: number };
  paid: { clicks: number; sessions: number; conversions: number };
  organic: { clicks: number; sessions: number; conversions: number };
}

export interface UnilizeClicksPoint {
  date: string;
  global: { ctr: number };
  paid: { clicks: number; cost: number };
  organic: { clicks: number };
}

export type UnilizeTimelineFilterQuery = {
  from?: string;
  until?: string;
  keyword?: string[];
  theme?: string[];
};

export type GetSummaryResult = {
  requestUrl: string;
  projectId: string;
  summary: UnilizeSummary | null;
  error: string | null;
};

export type ListTrafficResult = {
  requestUrl: string;
  projectId: string;
  points: UnilizeTrafficPoint[];
  error: string | null;
};

export type ListClicksResult = {
  requestUrl: string;
  projectId: string;
  points: UnilizeClicksPoint[];
  error: string | null;
};

export type ListThemesResult = {
  requestUrl: string;
  projectId: string;
  themes: string[];
  error: string | null;
};

/** @deprecated OpenAPI v2 — utiliser UnilizeSummary. */
export type UnilizeTimeline = UnilizeSummary;
/** @deprecated OpenAPI v2 — utiliser GetSummaryResult. */
export type GetTimelineResult = GetSummaryResult;
/** @deprecated OpenAPI v2 — utiliser UnilizeTrafficPoint. */
export type UnilizeTimelineTrafficPoint = UnilizeTrafficPoint;
/** @deprecated OpenAPI v2 — utiliser UnilizeClicksPoint. */
export type UnilizeTimelineCtrBudgetPoint = UnilizeClicksPoint;
/** @deprecated OpenAPI v2 — utiliser ListTrafficResult. */
export type ListTimelineTrafficResult = ListTrafficResult;
/** @deprecated OpenAPI v2 — utiliser ListClicksResult. */
export type ListTimelineCtrBudgetResult = ListClicksResult;
