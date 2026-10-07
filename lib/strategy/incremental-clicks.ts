import type {
  UnilizeOpportunity,
  UnilizeOpportunityMatrix,
} from "@/types/recommendations";

export type ChannelOpportunityShare = {
  keywordCount: number;
  volume: number;
  /** Part du volume de recherche en jeu (fraction 0–1). */
  share: number | null;
  /** (volume du domaine × effectif) / volume total. */
  weightedCount: number | null;
};

function readOpportunity(opportunity: UnilizeOpportunity): {
  keywordCount: number;
  volume: number;
} {
  const keywordCount = Number.isFinite(opportunity.keyword_count)
    ? opportunity.keyword_count
    : 0;
  const volume =
    Number.isFinite(opportunity.volume) && opportunity.volume > 0
      ? opportunity.volume
      : 0;
  return { keywordCount, volume };
}

function shareOf(
  keywordCount: number,
  volume: number,
  totalVolume: number,
): ChannelOpportunityShare {
  if (!Number.isFinite(totalVolume) || totalVolume <= 0 || volume <= 0) {
    return { keywordCount, volume, share: null, weightedCount: null };
  }
  const share = volume / totalVolume;
  return {
    keywordCount,
    volume,
    share,
    weightedCount: share * keywordCount,
  };
}

/**
 * Taux et nombre dérivés de la matrice d'opportunités.
 * SEO = lancer + maintenir SEO (aligné sur summary.seo_keywords_count).
 * SEA = optimiser + maintenir les annonces.
 * Volume total = volume de recherche en jeu.
 */
export function computeOpportunityChannelShares(
  matrix: UnilizeOpportunityMatrix,
  totalVolume: number,
): {
  seo: ChannelOpportunityShare;
  sea: ChannelOpportunityShare;
  hybrid: { keywordCount: number; volume: number };
} {
  const launchSeo = readOpportunity(matrix.launch_seo);
  const maintainSeo = readOpportunity(matrix.maintain_seo);
  const optimize = readOpportunity(matrix.optimize_ads);
  const maintainAds = readOpportunity(matrix.maintain_ads);
  const hybrid = readOpportunity(matrix.double_presence);

  return {
    seo: shareOf(
      launchSeo.keywordCount + maintainSeo.keywordCount,
      launchSeo.volume + maintainSeo.volume,
      totalVolume,
    ),
    sea: shareOf(
      optimize.keywordCount + maintainAds.keywordCount,
      optimize.volume + maintainAds.volume,
      totalVolume,
    ),
    hybrid,
  };
}
