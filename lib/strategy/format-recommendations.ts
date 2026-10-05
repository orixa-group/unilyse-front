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

export const OPPORTUNITY_MATRIX_DISPLAY_ORDER: OpportunityBucketKey[] = [
  "optimize_ads",
  "maintain_ads",
  "launch_seo",
  "double_presence",
  "review_strategy",
  "human_arbitration",
];

export const OPPORTUNITY_BUCKET_LABELS: Record<OpportunityBucketKey, string> = {
  optimize_ads: "Optimiser Ads",
  maintain_ads: "Maintenir Ads",
  launch_seo: "Lancer SEO",
  double_presence: "Double présence",
  review_strategy: "Revoir la stratégie",
  human_arbitration: "Arbitrage humain",
};

export const OPPORTUNITY_BUCKET_DESCRIPTIONS: Record<
  OpportunityBucketKey,
  string
> = {
  optimize_ads:
    "SEA à corriger — qualité, enchères ou structure des campagnes à optimiser.",
  maintain_ads:
    "SEA déjà performant — maintenir l’investissement publicitaire.",
  launch_seo: "Mots-clés recommandés pour un investissement SEO organique.",
  double_presence: "Mots-clés à travailler à la fois en SEA et en SEO.",
  review_strategy:
    "Ciblage à reconsidérer : l’effort SEO ou SEA actuel n’est plus pertinent.",
  human_arbitration:
    "Mots-clés nécessitant une décision ou un arbitrage expert.",
};

export function mapActionToOpportunityBucket(
  action: UnilizeRecommendationAction,
): OpportunityBucketKey {
  return action;
}

const ACTION_LABELS: Record<UnilizeRecommendationAction, string> = {
  ...OPPORTUNITY_BUCKET_LABELS,
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
