export const METRIC_GLOSSARY: Record<string, string> = {
  keyword: "Mot-clé ciblé dans le périmètre du projet.",
  search_volume: "Volume de recherche mensuel estimé.",
  impressions: "Nombre d'affichages de l'annonce (SEA).",
  clicks: "Nombre de clics sur l'annonce (SEA).",
  spend: "Dépense totale sur la période.",
  ctr: "Taux de clic (clics / impressions × 100).",
  cpc: "Coût moyen par clic.",
  conversions: "Nombre de conversions attribuées.",
  roas: "Retour sur dépense publicitaire (revenu / dépense).",
  quality_score: "Score qualité Google (0 = non attribué, 1–10).",
  match_type: "Type de correspondance : BROAD, PHRASE ou EXACT.",
  budget_lost_impression_share:
    "Part des impressions éligibles perdues faute de budget (Google Ads, 0–100 %). Enchères où l'annonce aurait pu s'afficher mais le budget journalier ou la répartition budgétaire l'en a empêché.",
  rank_lost_impression_share:
    "Part des impressions éligibles perdues faute de rang publicitaire (Google Ads, 0–100 %). Ad Rank insuffisant : enchère, Quality Score, pertinence de l'annonce ou page de destination.",
  potential_impressions_budget:
    "Volume d'impressions supplémentaires estimé par Google Ads si la contrainte budget était levée, le rang actuel étant conservé. Scénario « et si » distinct du potentiel rang — estimation indicative sur la période, pas un objectif garanti.",
  potential_impressions_rank:
    "Volume d'impressions supplémentaires estimé par Google Ads si la contrainte de rang (enchère × qualité) était levée, le budget actuel étant conservé. Scénario « et si » distinct du potentiel budget — estimation indicative sur la période, pas un objectif garanti.",
  seo_impressions: "Affichages dans les résultats organiques.",
  seo_clicks: "Clics depuis la recherche organique.",
  seo_ctr: "Taux de clic organique.",
  seo_bas:
    "Score d'autorité de l'URL (BAS) : Optimisé ou Sous-optimisé vs concurrents.",
  authority_status:
    "Statut d'autorité de l'URL : Optimisé ou Sous-optimisé vs concurrents.",
  competitor_count: "Nombre d'annonceurs actifs sur ce mot-clé.",
  status:
    "Recommandation : Cibler (forte opportunité), À évaluer, ou Ignorer.",
  recommendation: "Canal recommandé : SEO, SEA ou SEO + SEA.",
  backlink_gap:
    "Écart de backlinks pour atteindre la position #1 (valeur négative).",
  semantic_gap:
    "Mot-clé dont la couverture sémantique n’est pas optimisée vs concurrents.",
  semantic_status:
    "Statut de couverture sémantique du contenu : Optimisé ou Sous-optimisé.",
  ad_relevance:
    "Évaluation Google Ads de la pertinence de l'annonce par rapport au mot-clé.",
  expected_ctr:
    "CTR attendu selon Google Ads (below_average, average, above_average).",
  landing_page_ux:
    "Qualité perçue de l'expérience sur la page de destination.",
  impression_share: "Part d'impressions obtenue sur le mot-clé (SEA).",
  conversion_rate: "Taux de conversion SEA sur la période (0–100 %).",
  position: "Position moyenne dans les résultats organiques.",
  page_intent_match:
    "La page cible correspond-elle à l'intention de recherche du mot-clé ?",
};

export function getMetricGlossary(id: string): string | undefined {
  return METRIC_GLOSSARY[id];
}
