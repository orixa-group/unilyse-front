# Inventaire OpenAPI vs front — Unilyze

Références :

- Contrat API : [OpenAPI Unilize](https://public-api-531732557398.europe-west9.run.app/openapi.yaml) (audit sept. 2026)
- Spec UI : [`docs/Unilyze - Ecrans.pdf`](./Unilyze%20-%20Ecrans.pdf)

Légende :

| Statut | Signification |
|--------|----------------|
| **OK** | Présent API + branché front |
| **Aligné types** | Typé / partiellement affiché, UI incomplète |
| **Retiré API** | Encore dans le front, plus dans OpenAPI |
| **Manquant front** | Dans OpenAPI, pas (ou plus) d’UI |
| **Hors scope** | Écran PDF sans endpoint |

---

## 1. Écarts corrigés dans cette passe

| Sujet | Avant (front) | OpenAPI | Action |
|-------|---------------|---------|--------|
| `S_SEO_invest` | Placeholder | `scoring.seo.invest_score` (0–10) | Colonne branchée |
| `delay_status` | `time_to_value_*` | `delay_score` / `delay_status` (`short/medium/long`) | Déjà migré |
| `semantic_status` / `authority_status` | binaire | 4 / 5 niveaux | Déjà migré |
| `scoring.sea.status` | `low/high` | `low/medium_low/medium_high/high` | Déjà migré |
| `scoring.sea.band` | — | Retiré | RAS |
| `ctr_benchmark` | absent puis `>= 0` | requis, `> 0` et `<= 100` | Formulaire + validation `gt(0)` |
| `KeywordComparison.trigger` | colonne Note stub | `quality_score` / `no_data` / `no_conversions` / `matrix` | Colonne « Règle » |
| `accessibility_score` | absent | `scoring.seo.accessibility_score` | Typé (pas d’UI dédiée) |
| `Timeline.decisions` | absent | tableau `Decision[]` requis | Typé |
| `PerformanceSEA.match_type` | colonne Match | **retiré** | Colonne « Indispo. » |
| Filtre reco | 4 valeurs | 7 enums | + `OPTIMIZE_ADS` / `HUMAN_ARBITRATION` |

---

## 2. Performances

| Champ OpenAPI | Front | Statut |
|---------------|-------|--------|
| `sea.*` (impressions, clicks, spend, ctr, cpc, conversions, conversion_value, quality_score, lost shares, potentials, ad_relevance, expected_ctr, landing_page_ux, conversion_rate, cost_per_conversion, roas) | Colonnes | **OK** |
| `sea.match_type` | Colonne encore listée | **Retiré API** |
| `search_volume.volume` | Colonne | **OK** |
| `seo.*` + concurrents avg/min/max | Colonnes | **OK** |
| Scores Babbar / SERPmantics **du projet** | — | Toujours **absent API** |
| Query `theme` / `keyword` sur `/performances` | Filtre MK client uniquement | **Partiel** — pas de query OpenAPI |

---

## 3. Stratégie

### Tableau keyword_comparisons

| Champ OpenAPI | Front | Statut |
|---------------|-------|--------|
| `recommendation` | Badge + filtre | **OK** |
| `trigger` | Colonne Règle | **OK** |
| `search_volume` | Colonne | **OK** |
| `scoring.sea` D1–D5 + `score` + `status` | Badges | **OK** — attention **échelles différentes** (voir §3.1) |
| `seo.semantic_status` / `authority_status` | Contenu / Popularité | **OK** |
| `seo.position` | Colonne | **OK** |
| `seo.page_intent_match` | Typé, pas de colonne | **Manquant front** |
| `scoring.seo.delay_status` / `potential_gain_status` | E4 / E5 | **OK** |
| `scoring.seo.invest_score` | S_SEO_invest | **OK** |
| `scoring.seo.accessibility_score` | Typé seulement | **Aligné types** |
| `scoring.seo.effort_status` | Colonne | **OK** |
| `note` PDF | N’existe pas | **Hors scope** — remplacé par `trigger` |

### 3.1 Échelles D1–D5 (OpenAPI ≠ mapping UI 1–5)

L’UI affiche Nul → Très bien sur 1–5. L’API documente :

| Dimension | Valeurs API |
|-----------|-------------|
| D1 Volume | **1, 2 ou 3** |
| D2 Budget | **1, 2 ou 3** |
| D3 Conversion | **1 à 4** |
| D4 Quality + conviv. | **1 à 5** |
| D5 CTR incrémental | **1 à 3** |

Un 3 en D1 est donc le **plafond**, pas un « Moyen ». À décider produit : labels par dimension, ou garder 1–5 générique.

### 3.2 Autres

| Zone | OpenAPI | Front | Statut |
|------|---------|-------|--------|
| Gaps `priority` | number 0–10 (= invest_score) | `formatDecimal` | **OK** |
| Matrice 4 buckets | `opportunity_matrix` | StatCards | **OK** |
| `POST /projects/{id}/decisions` | Decision | Aucun client / UI | **Manquant front** |
| `GET /timeline` → `decisions[]` | journal période | Typé, pas affiché | **Manquant front** |

---

## 4. Timeline

| Zone | OpenAPI | Front | Statut |
|------|---------|-------|--------|
| KPI `global` / `sea` / `seo` | clicks, conversions, shares, CTR, no-click | StatCards | **OK** |
| `…/timeline/traffic` | clicks, sessions, conversions | Graph Trafic + Conversions | **OK** |
| `…/timeline/ctr-budget` | clicks, cost, CTR + filtres `keyword[]` / `theme[]` | Graph + thème | **OK** — filtre MK API non exposé UI |
| `decisions` | requis sur `Timeline` | Non affiché | **Manquant front** |

---

## 5. Décisions expert (nouveau contrat)

`POST /projects/{projectId}/decisions`

- Body : `keyword`, `applied` (enum reco sans `UNKNOWN`), `justification` si écart vs reco serveur
- Réponse : `Decision` (applied, recommended, decided_by, decided_at…)
- Historique : `GET /timeline` → `decisions[]` (append-only)

Pas d’endpoint GET dédié liste hors timeline. **Aucune UI** aujourd’hui.

---

## 6. Thématiques / Refresh / Monitoring

| Élément | OpenAPI | Front | Statut |
|---------|---------|-------|--------|
| `GET /themes` | liste | Timeline + filtre | **OK** |
| `Keyword.theme` PUT | oui | préservé au re-save | **OK** |
| UI assignation thème | — | Non | **Hors scope** |
| `POST …/refresh` | 204, `?keyword=` optionnel | Bouton projet | **OK** / unitaire **Partiel** |
| Monitoring | keyword, volume, competitor_count, target/consider/ignore | Tableau | **OK** vs PDF Concurrence SEA toujours **Hors scope** |

---

## 7. Backlog recommandé (priorisé)

1. **UI Décisions** — enregistrer une action expert + journal Timeline
2. **Labels D1–D5** adaptés aux plafonds 3 / 4 / 5
3. Colonne ou badge `page_intent_match`
4. Retirer définitivement la colonne `match_type` (localStorage presets)
5. Filtre mot-clé Timeline via query `keyword[]`
6. Afficher `accessibility_score` si besoin métier (déjà dans `invest_score`)
7. Scores projet Babbar / SERPmantics — toujours **absent API**
8. Écran Concurrence SEA PDF — **absent API**
