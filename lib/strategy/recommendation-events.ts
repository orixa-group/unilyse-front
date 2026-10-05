import { formatKeywordLabel } from "@/lib/projects/keywords";
import { formatRecommendationAction } from "@/lib/strategy/format-recommendations";
import type { UnilizeKeywordRecommendation } from "@/types/recommendations";

export type RecommendationTimelineEvent = {
  keyword: string;
  analyzedOn: string;
  action: string;
  actionLabel: string;
  paidReason: string;
  organicReason: string;
};

export function buildRecommendationTimelineEvents(
  rows: readonly UnilizeKeywordRecommendation[],
): RecommendationTimelineEvent[] {
  const events: RecommendationTimelineEvent[] = [];
  for (const row of rows) {
    const reco = row.recommendation;
    if (!reco?.analyzed_on?.trim()) {
      continue;
    }
    events.push({
      keyword: formatKeywordLabel(row.keyword),
      analyzedOn: reco.analyzed_on,
      action: reco.action,
      actionLabel: formatRecommendationAction(reco.action),
      paidReason: reco.paid?.reason?.trim() ?? "",
      organicReason: reco.organic?.reason?.trim() ?? "",
    });
  }
  events.sort((a, b) => {
    const byDate = b.analyzedOn.localeCompare(a.analyzedOn);
    if (byDate !== 0) {
      return byDate;
    }
    return a.keyword.localeCompare(b.keyword, "fr");
  });
  return events;
}
