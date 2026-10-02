import type { UnilizeRecommendationAction } from "@/types/recommendations";
import type { UnilizeOpportunityMatrix } from "@/types/recommendations";

export const STRATEGY_RECOMMENDATION_FILTER_OPTIONS = [
  "optimize_ads",
  "maintain_ads",
  "launch_seo",
  "double_presence",
  "review_strategy",
  "human_arbitration",
] as const satisfies readonly UnilizeRecommendationAction[];

export type StrategyRecommendationFilterValue =
  (typeof STRATEGY_RECOMMENDATION_FILTER_OPTIONS)[number];

export type OpportunityBucketKey = keyof UnilizeOpportunityMatrix;

export const OPPORTUNITY_BUCKET_LABELS: Record<OpportunityBucketKey, string> = {
  launch_seo: "Lancer SEO",
  double_presence: "Double présence",
  maintain_ads: "Maintenir Ads",
  review_strategy: "Revoir la stratégie",
};

export const OPPORTUNITY_BUCKET_DESCRIPTIONS: Record<OpportunityBucketKey, string> =
  {
    launch_seo: "Mots-clés recommandés pour un investissement SEO organique.",
    double_presence:
      "Mots-clés à travailler à la fois en SEA et en SEO.",
    maintain_ads:
      "SEA performant ou à optimiser — maintenir ou corriger l’investissement publicitaire.",
    review_strategy:
      "Ciblage à reconsidérer ou arbitrage expert (effort SEO peu pertinent).",
  };

export function mapActionToOpportunityBucket(
  action: UnilizeRecommendationAction,
): OpportunityBucketKey | null {
  switch (action) {
    case "launch_seo":
      return "launch_seo";
    case "double_presence":
      return "double_presence";
    case "optimize_ads":
    case "maintain_ads":
      return "maintain_ads";
    case "review_strategy":
    case "human_arbitration":
      return "review_strategy";
    default:
      return null;
  }
}

const ACTION_LABELS: Record<UnilizeRecommendationAction, string> = {
  optimize_ads: "Optimiser Ads",
  maintain_ads: "Maintenir Ads",
  launch_seo: "Lancer SEO",
  double_presence: "Double présence",
  review_strategy: "Revoir la stratégie",
  human_arbitration: "Arbitrage humain",
};

export function formatRecommendationAction(
  action: UnilizeRecommendationAction | string,
): string {
  const key = action as UnilizeRecommendationAction;
  return ACTION_LABELS[key] ?? action;
}

/** Clé attendue par `recommendationTone` (SCREAMING_SNAKE). */
export function recommendationToneKey(action: string): string {
  return action.toUpperCase().replace(/-/g, "_");
}
