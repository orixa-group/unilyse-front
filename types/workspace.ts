export type AnalysisLens = "sea" | "seo";

export type ContextRequirement = "none" | "client" | "project" | "project-campaign";

export const ANALYSIS_LENS_LABELS: Record<AnalysisLens, string> = {
  sea: "SEA",
  seo: "SEO",
};
