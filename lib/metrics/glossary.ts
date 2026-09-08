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
    "Part des recherches sans clic SEA ni SEO, en % — (1 − (clics SEA + clics SEO) / volume) × 100.",
  collection_status:
    "État de collecte des métriques (en cours / terminé) par source : SEA, SEO, volume, ranking, autorité, sémantique.",
  seo_impressions: "Affichages dans les résultats organiques.",
  seo_clicks: "Clics depuis la recherche organique.",
  seo_ctr: "Taux de clic organique.",
  average_position:
    "Position organique moyenne sur la période, pondérée par les impressions (Search Console).",
  real_time_position:
    "Dernière position organique connue (snapshot ValueSERP), distincte de la moyenne Search Console.",
  netlinking_avg:
    "Score d'autorité (BAS) moyen des 5 premiers concurrents classés sur ce mot-clé.",
  semantic_avg:
    "Score de contenu (sémantique) moyen des 5 premiers concurrents classés sur ce mot-clé.",
  semantic_max:
    "Score sémantique maximal parmi les 5 premiers concurrents classés sur ce mot-clé.",
  semantic_min:
    "Score sémantique minimal parmi les 5 premiers concurrents classés sur ce mot-clé.",
  netlinking_score:
    "Score netlinking (Babbar) du projet sur ce mot-clé — non encore exposé par l'API.",
  semantic_score:
    "Score sémantique (SERPmantics) du projet sur ce mot-clé — non encore exposé par l'API.",
  ctr_global:
    "CTR global dérivé : (clics SEA + clics SEO) / volume de recherche × 100.",
  authority_status:
    "Statut d'autorité / netlinking vs concurrents : leader, optimisé, à optimiser, plutôt dégradé ou dégradé.",
  competitor_count: "Nombre d'annonceurs actifs sur ce mot-clé.",
  status:
    "Recommandation monitoring : Cibler (forte opportunité), À évaluer, ou Ignorer.",
  recommendation: "Canal recommandé : SEO, SEA ou SEO + SEA.",
  gap: "Écart de score (autorité ou sémantique) par rapport à la moyenne des top-3 concurrents.",
  semantic_gap:
    "Mot-clé dont la couverture sémantique n’est pas optimisée vs concurrents.",
  semantic_status:
    "Statut de couverture sémantique du contenu : leader, optimisé, à optimiser ou dégradé.",
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
  sea_score: "Score composite SEA (S_SEA) dérivé des dimensions D1–D5.",
  d1_volume:
    "Dimension D1 — volume de recherche vs moyenne compte (API : 1, 2 ou 3).",
  d2_budget:
    "Dimension D2 — part d'impressions perdues budget (API : 1, 2 ou 3).",
  d3_conversion:
    "Dimension D3 — taux et volume de conversion vs moyenne compte (API : 1 à 4).",
  d4_ad:
    "Dimension D4 — quality score + convivialité landing (API : 1 à 5).",
  d5_ctr:
    "Dimension D5 — part d'impressions perdues rang, modulée par le CTR benchmark (API : 1 à 3).",
  sea_status:
    "Statut SEA sur 4 niveaux : Faible, Moyen bas, Moyen haut, Élevé.",
  effort_status: "Niveau d'effort SEO (low / medium / high).",
  delay_status: "Délai estimé avant valeur SEO (short / medium / long).",
  potential_gain_status: "Gain potentiel SEO (low / medium / high).",
  s_seo_invest:
    "Score d'investissement SEO (S_SEO_invest, 0–10) — `scoring.seo.invest_score`, priorisation au sein du fichier recommandation.",
  note: "Règle qui a produit la recommandation (trigger API).",
  trigger:
    "Règle à l'origine de la recommandation : Quality Score, données insuffisantes, sans conversion, ou matrice de décision.",
  content_label:
    "Statut de couverture sémantique du contenu : leader, optimisé, à optimiser ou dégradé.",
  popularity_label:
    "Statut d'autorité / popularité de l'URL : leader, optimisé, à optimiser, plutôt dégradé ou dégradé.",
};

export function getMetricGlossary(id: string): string | undefined {
  return METRIC_GLOSSARY[id];
}
