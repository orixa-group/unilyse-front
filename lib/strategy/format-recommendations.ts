import type { UnilizeRecommendationAction } from "@/types/recommendations";
import type { UnilizeOpportunityMatrix } from "@/types/recommendations";

export const STRATEGY_RECOMMENDATION_FILTER_OPTIONS = [
  "optimize_ads",
  "maintain_ads",
  "reduce_ads",
  "launch_seo",
  "maintain_seo",
  "withdraw_seo",
  "double_presence",
  "human_arbitration",
] as const satisfies readonly UnilizeRecommendationAction[];

export type StrategyRecommendationFilterValue =
  (typeof STRATEGY_RECOMMENDATION_FILTER_OPTIONS)[number];

export type OpportunityBucketKey = keyof UnilizeOpportunityMatrix;

export const OPPORTUNITY_MATRIX_DISPLAY_ORDER: OpportunityBucketKey[] = [
  "optimize_ads",
  "maintain_ads",
  "reduce_ads",
  "launch_seo",
  "maintain_seo",
  "withdraw_seo",
  "double_presence",
  "human_arbitration",
];

export const OPPORTUNITY_BUCKET_LABELS: Record<OpportunityBucketKey, string> = {
  optimize_ads: "Optimiser Ads",
  maintain_ads: "Maintenir Ads",
  reduce_ads: "Réduire Ads",
  launch_seo: "Lancer SEO",
  maintain_seo: "Maintenir SEO",
  withdraw_seo: "Retirer SEO",
  double_presence: "Double présence",
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
  reduce_ads:
    "SEA coûteux ou en doublon avec le SEO — réduire l’investissement payant.",
  launch_seo: "Mots-clés recommandés pour un investissement SEO organique.",
  maintain_seo:
    "SEO déjà performant et le SEA n’y ajoute rien — conserver la position.",
  withdraw_seo:
    "L’effort SEO ne se justifie pas — ne pas ou ne plus y investir.",
  double_presence: "Mots-clés à travailler à la fois en SEA et en SEO.",
  human_arbitration:
    "Décision expert requise : aucun clic SEA ou historique trop court pour juger.",
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
