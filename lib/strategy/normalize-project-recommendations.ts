import {
  emptyProjectRecommendations,
  type UnilizeProjectRecommendations,
} from "@/types/recommendations";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Tolère une réponse partielle ; défaut sûr pour BFF / hook. */
export function normalizeProjectRecommendations(
  raw: unknown,
): UnilizeProjectRecommendations {
  if (!isRecord(raw)) {
    return emptyProjectRecommendations();
  }

  const base = emptyProjectRecommendations();
  const keywords = Array.isArray(raw.keywords) ? raw.keywords : base.keywords;

  const summaryRaw = isRecord(raw.summary) ? raw.summary : {};
  const summary = {
    seo_keywords_count: Number(summaryRaw.seo_keywords_count) || 0,
    sea_keywords_count: Number(summaryRaw.sea_keywords_count) || 0,
    hybrid_keywords_count: Number(summaryRaw.hybrid_keywords_count) || 0,
  };

  const matrixRaw = isRecord(raw.opportunity_matrix)
    ? raw.opportunity_matrix
    : {};
  const readOpportunity = (key: keyof UnilizeProjectRecommendations["opportunity_matrix"]) => {
    const o = isRecord(matrixRaw[key]) ? matrixRaw[key] : {};
    return {
      keyword_count: Number(o.keyword_count) || 0,
      volume: Number(o.volume) || 0,
    };
  };

  const opportunity_matrix = {
    launch_seo: readOpportunity("launch_seo"),
    double_presence: readOpportunity("double_presence"),
    maintain_ads: readOpportunity("maintain_ads"),
    review_strategy: readOpportunity("review_strategy"),
  };

  const netlinking_gaps = Array.isArray(raw.netlinking_gaps)
    ? raw.netlinking_gaps
    : [];
  const semantic_gaps = Array.isArray(raw.semantic_gaps)
    ? raw.semantic_gaps
    : [];

  return {
    keywords,
    summary,
    opportunity_matrix,
    netlinking_gaps,
    semantic_gaps,
  } as UnilizeProjectRecommendations;
}
