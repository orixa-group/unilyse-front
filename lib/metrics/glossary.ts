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
    "Part d'impressions perdues faute de budget suffisant (0–100 %).",
  rank_lost_impression_share:
    "Part d'impressions perdues faute de rang / qualité (0–100 %).",
  potential_impressions_budget:
    "Impressions estimées si la perte budget était nulle.",
  potential_impressions_rank:
    "Impressions estimées si la perte de rang était nulle.",
  seo_impressions: "Affichages dans les résultats organiques.",
  seo_clicks: "Clics depuis la recherche organique.",
  seo_ctr: "Taux de clic organique.",
  seo_bas:
    "Score d'autorité de l'URL (BAS) : Optimisé ou Sous-optimisé vs concurrents.",
  competitor_count: "Nombre d'annonceurs actifs sur ce mot-clé.",
  status:
    "Recommandation : Cibler (forte opportunité), À évaluer, ou Ignorer.",
  recommendation: "Canal recommandé : SEO, SEA ou SEO + SEA.",
  backlink_gap:
    "Écart de backlinks pour atteindre la position #1 (valeur négative).",
  semantic_gap:
    "Mot-clé dont la couverture sémantique n’est pas optimisée vs concurrents.",
  semantic_score:
    "Couverture sémantique du contenu : optimisé ou non optimisé (StrategySEO).",
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
