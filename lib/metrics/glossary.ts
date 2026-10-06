export const METRIC_GLOSSARY: Record<string, string> = {
  keyword: "Mot-clé ciblé dans le périmètre du projet.",
  search_volume:
    "Volume de recherche mensuel estimé par mot-clé. Non proratisé sur la période d’analyse : les graphiques Timeline (clics, CTR, coûts) restent journaliers ou hebdomadaires, sans volume hebdo natif.",
  impressions: "Nombre d'affichages de l'annonce (SEA).",
  clicks: "Nombre de clics sur l'annonce (SEA).",
  spend: "Dépense totale sur la période (alias legacy « spend »).",
  cost: "Dépense totale SEA sur la période.",
  ctr: "Taux de clic SEA (fraction 0–1, affiché en %).",
  cpc: "Coût moyen par clic.",
  conversions: "Nombre de conversions attribuées.",
  roas: "Retour sur dépense publicitaire (revenu / dépense).",
  quality_score: "Score qualité Google (0 = non attribué, 1–10).",
  match_type:
    "Ancien type de correspondance Google Ads — retiré de l’API Performances.",
  budget_lost_impression_share:
    "Part des impressions éligibles perdues faute de budget (Google Ads, 0–100 %). Enchères où l'annonce aurait pu s'afficher mais le budget journalier ou la répartition budgétaire l'en a empêché.",
  rank_lost_impression_share:
    "Part des impressions éligibles perdues faute de rang publicitaire (Google Ads, 0–100 %). Ad Rank insuffisant : enchère, Quality Score, pertinence de l'annonce ou page de destination.",
  potential_impressions_budget:
    "Volume d'impressions supplémentaires estimé par Google Ads si la contrainte budget était levée, le rang actuel étant conservé. Scénario « et si » distinct du potentiel rang — estimation indicative sur la période, pas un objectif garanti.",
  potential_impressions_rank:
    "Volume d'impressions supplémentaires estimé par Google Ads si la contrainte de rang (enchère × qualité) était levée, le budget actuel étant conservé. Scénario « et si » distinct du potentiel budget — estimation indicative sur la période, pas un objectif garanti.",
  no_click_rate:
    "Part des recherches sans clic SEA ni SEO (fraction 0–1, affichée en %). Null si le volume est inconnu ou nul.",
  collection_status:
    "État de collecte par source (SEA, SEO, volume, position, autorité, sémantique). « À jour » seulement si chaque source est terminée. Une source non récupérée n'est pas à jour.",
  seo_impressions: "Affichages dans les résultats organiques.",
  seo_clicks: "Clics depuis la recherche organique.",
  seo_ctr: "Taux de clic organique (fraction 0–1, affiché en %).",
  average_position:
    "Position organique moyenne sur la période, pondérée par les impressions (Search Console).",
  real_time_position:
    "Position organique constatée à la date lue (`organic_ranking.position`), distincte de la moyenne Search Console. Vide si le mot-clé n’est pas classé.",
  semantic_score:
    "Score sémantique de la page du projet (`page_semantics.ours.score`).",
  semantic_avg:
    "Score sémantique moyen des concurrents (`page_semantics.competitors.score.average`).",
  semantic_max:
    "Score sémantique maximal des concurrents (`page_semantics.competitors.score.max`).",
  semantic_min:
    "Score sémantique minimal des concurrents (`page_semantics.competitors.score.min`).",
  netlinking_score:
    "Score d'autorité (BAS) de la page du projet (`url_authorities.ours.authority_score`).",
  netlinking_trust:
    "Page Trust de la page du projet (`url_authorities.ours.page_trust`).",
  netlinking_backlinks:
    "Nombre de backlinks externes de la page du projet (`url_authorities.ours.backlinks_external`).",
  netlinking_domains:
    "Nombre de domaines référents de la page du projet (`url_authorities.ours.backlinks_domains`).",
  netlinking_avg:
    "Score d'autorité moyen des concurrents (`url_authorities.competitors.authority_score.average`).",
  netlinking_max:
    "Score d'autorité maximal des concurrents (`url_authorities.competitors.authority_score.max`).",
  netlinking_min:
    "Score d'autorité minimal des concurrents (`url_authorities.competitors.authority_score.min`).",
  ctr_global:
    "CTR global dérivé : (clics SEA + clics SEO) / volume de recherche (fraction 0–1, affiché en %).",
  authority_status:
    "Statut d'autorité / netlinking vs concurrents : leader, optimisé, à optimiser, plutôt dégradé ou dégradé.",
  competitor_count: "Nombre d'annonceurs actifs sur ce mot-clé.",
  acquisitions:
    "État d'acquisition par canal (SEA / SEO) : cibler, à évaluer ou ignorer.",
  status: "Alias legacy — voir « acquisitions ».",
  ad_relevance:
    "Évaluation Google Ads de la pertinence de l'annonce par rapport au mot-clé.",
  expected_ctr:
    "CTR attendu selon Google Ads : inférieur, dans ou supérieur à la moyenne des annonces comparables.",
  landing_page_ux:
    "Qualité perçue de l'expérience sur la page de destination.",
  incremental_ctr:
    "Potentiel de gain de CTR SEA (seuil atteint, contraint par le rang ou non limité).",
  organic_accessibility:
    "Accessibilité SEO du mot-clé (facilité d’atteindre les premières positions organiques).",
  impression_share: "Part d'impressions obtenue sur le mot-clé (SEA).",
  conversion_rate:
    "Taux de conversion SEA sur la période (fraction 0–1, affiché en %).",
  position: "Position moyenne dans les résultats organiques.",
};

export function getMetricGlossary(id: string): string | undefined {
  return METRIC_GLOSSARY[id];
}
