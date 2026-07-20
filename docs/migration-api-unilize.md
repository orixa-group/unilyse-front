# Synthèse — Migration API Unilize (front Unilyse)

> **Date** : juin 2026  
> **Référence** : [OpenAPI Unilize](https://public-api-531732557398.europe-west9.run.app/openapi.yaml)  
> **Statut** : changements locaux prêts, **non encore commités / déployés** (46 fichiers, ~−1 480 lignes nettes)

---

## Contexte

L’API Unilize a évolué : la notion de **campagne liée au projet** est supprimée. Les métriques analytics (performances, stratégie, monitoring) sont désormais au **niveau projet**, avec une période optionnelle `from` / `to`. Le front a été refactoré en conséquence.

En parallèle, un correctif infra a été appliqué (déjà commité) pour que les appels API fonctionnent en production Cloud Run.

---

## Changement architectural (avant → après)

| Domaine | Avant | Après |
|---|---|---|
| Contexte analytics | Client → Projet → **Campagne** | Client → **Projet** |
| Performances | `GET /projects/{id}/campaigns/{campaignId}/performances` | `GET /projects/{projectId}/performances` |
| Stratégie | `GET …/campaigns/{campaignId}/strategy` | `GET /projects/{projectId}/strategy` |
| Monitoring | `GET …/campaigns/{campaignId}/monitoring` | `GET /projects/{projectId}/monitoring` |
| Campagnes | CRUD + link/unlink campagne | **Supprimé** |
| Période | Non gérée | Query params `from` / `to` (YYYY-MM-DD) |
| Setup projet | `customer_id` + mots-clés + **campagne** | `customer_id` + mots-clés |
| Sync SEA | Par campagne liée | Au niveau compte Google Ads (`customer_id`) |

---

## Infrastructure & production (commits précédents)

Ces changements corrigent le 404 / « Erreur API » en prod :

### Proxy explicite `/api/unilize/*`

- **Ajout** : `app/api/unilize/[...path]/route.ts` — proxy vers l’API upstream.
- **Suppression** : rewrites dans `next.config.ts` (ignorés par Google Cloud Buildpacks).
- **Fix `API_URL` vide** : garde-fou `serverUrl?.startsWith("http")` dans le proxy et `lib/api/client.ts` (évite `Invalid URL` quand `API_URL=""` en Cloud Run).

### Fichiers concernés (déjà commités)

- `app/api/unilize/[...path]/route.ts`
- `next.config.ts`
- `lib/api/client.ts`

---

## Endpoints (`lib/constants/api-endpoints.ts`)

**Supprimés :**

- `projectCampaigns`
- `projectCampaign`
- `campaignPerformances`
- `campaignStrategy`
- `campaignMonitoring`

**Ajoutés :**

- `projectPerformances(projectId)`
- `projectStrategy(projectId)`
- `projectMonitoring(projectId)`

**Inchangés :** `CLIENTS`, `client`, `clientProjects`, `project`, `projectKeywords`, `SITES`.

---

## SDK API (`lib/api/unilize.ts`)

**Supprimé :**

- `listCampaigns`, `getCampaign`, `linkCampaign`, `unlinkCampaign`
- Clés React Query `campaign*`

**Modifié :**

- `listPerformances(projectId, period?)`
- `getStrategy(projectId, period?)`
- `listKeywordMonitoring(projectId, period?)`
- Clés `unilizeKeys` incluent `from` / `to` pour le cache

---

## Types TypeScript

### `types/unilize.ts`

- Suppression : `UnilizeCampaign`, `LinkCampaignPayload`
- `UnilizeProject.url` et `customer_id` **requis**
- Ajout : `UnilizePeriodQuery { from?, to? }`

### `types/performance.ts`

- `UnilizeSeaMetrics` simplifié (plus de champs campagne/mot-clé/période)
- `UnilizeSearchVolume` : `{ volume }` uniquement
- `UnilizeSeoMetrics` : `impressions`, `clicks`, `ctr` (plus de BAS)
- `UnilizePerformance.search_volume` et `.seo` toujours présents
- `ListPerformancesResult` : plus de `campaignId`

### `types/strategy.ts`

- Nouvelles recommandations : `OPTIMIZE_ADS`, `MAINTAIN_ADS`, `LAUNCH_SEO`, `DOUBLE_PRESENCE`, `REVIEW_STRATEGY`, `HUMAN_ARBITRATION`, `UNKNOWN`
- `UnilizeStrategySeaTier` : `UNSPECIFIED`, `UNKNOWN`, `BELOW_AVERAGE`, etc.
- `semantic_score` → `semantic_status`, `authority_score` → `authority_status`
- `KeywordComparison.search_volume` requis
- `GetStrategyResult` : plus de `campaignId`

### `types/monitoring.ts`

- `ListMonitoringResult` : plus de `campaignId`

### `types/unilize-dashboard.ts`

- Payload dashboard : plus de `campaigns` / `campaignsError` par projet

### `types/workspace.ts`

- `ContextRequirement` : `"project-campaign"` conservé pour rétrocompatibilité, routes analytics passent à `"project"`

---

## Routes BFF

### Supprimées

```
app/api/bff/projects/[projectId]/campaigns/route.ts
app/api/bff/projects/[projectId]/campaigns/[campaignId]/performances/route.ts
app/api/bff/projects/[projectId]/campaigns/[campaignId]/strategy/route.ts
app/api/bff/projects/[projectId]/campaigns/[campaignId]/monitoring/route.ts
```

### Ajoutées

```
app/api/bff/projects/[projectId]/performances/route.ts
app/api/bff/projects/[projectId]/strategy/route.ts
app/api/bff/projects/[projectId]/monitoring/route.ts
```

→ Appellent l’upstream au niveau projet, transmettent `from` / `to`.

### Modifiée

- `app/api/bff/clients/[clientId]/dashboard/route.ts` — plus de chargement campagnes par projet

---

## Hooks

| Fichier | Changement |
|---|---|
| `hooks/use-project-context.ts` | **Nouveau** — remplace la logique projet+campagne |
| `hooks/use-sync-project-selection.ts` | **Nouveau** — sync sélection projet seule |
| `hooks/use-project-campaign-context.ts` | Alias `@deprecated` → `useProjectContext` |
| `hooks/use-sync-project-campaign-selection.ts` | **Supprimé** |
| `hooks/use-strategy-api.ts` | `projectId` + `period`, plus de `campaignId` |
| `hooks/use-performances-api.ts` | idem |
| `hooks/use-monitoring-api.ts` | idem |
| `hooks/use-unilize-api.ts` | Suppression hooks campagnes (`useCampaigns`, `useLinkCampaignMutation`, etc.) |
| `hooks/use-project-sync-probe.ts` | Probe sur `/performances` projet, plus de `campaignId` |

---

## Store Zustand (`stores/selection.store.ts`)

**Supprimé :**

- `selectedCampaignId`, `setSelectedCampaignId`

**Ajouté :**

- `periodFrom`, `periodTo`, `setPeriod(from, to)` — persistés

---

## Server Actions

### `app/(auth)/actions/unilize-actions.ts`

- Suppression : `linkCampaignAction`, `unlinkCampaignAction`, schémas Zod associés

### `app/(auth)/actions/unilize-action-state.ts`

- Suppression : `ListCampaignsResult`, `LinkCampaignActionState`, `UnlinkCampaignActionState`

---

## Composants UI

### Layout & navigation

- `workspace-context-bar.tsx` — sélecteur campagne retiré ; filtres date Du/Au + réinitialiser
- `context-guard.tsx` — analytics accessibles avec projet seul (plus de campagne requise)
- `config/site.config.ts` — `requiresContext: "project"` pour Performances / Stratégie / Monitoring

### Dashboard

- `dashboard-view.tsx` — plus de gestion campagnes (link/unlink, stats)
- `project-card.tsx` — section campagnes supprimée
- `project-setup-banner.tsx` — plus d’exigence « campagne disponible »
- `dashboard-health-summary.tsx` — stats campagnes retirées

### Vues analytics

- `performances-view.tsx`, `strategy-view.tsx`, `monitoring-view.tsx` — `useProjectContext` + `period`

### Stratégie

- `strategy-keyword-table.tsx` — colonnes `semantic_status` / `authority_status`, nouvelles recommandations
- `strategy-recommendation-badge.tsx` — mapping des 7 enums
- `format-strategy.ts`, `metric-tone.ts` — labels et tons mis à jour

---

## Lib utilitaires

| Fichier | Changement |
|---|---|
| `lib/projects/project-readiness.ts` | Setup = `customer_id` + mots-clés (plus campagne) |
| `lib/strategy/format-bas.ts` | Suppression BAS legacy ; `formatAuthorityScoreLabel` via `authority_status` |
| `lib/strategy/resolve-bas-label.ts` | `resolveStrategyAuthorityLabel` / `resolveStrategySemanticLabel` |
| `lib/strategy/column-presets.ts` | Colonnes `authority_status`, `semantic_status` |
| `lib/metrics/glossary.ts` | Descriptions mises à jour |
| `lib/unilize/request-log.ts` | Logs campagnes supprimés |
| `lib/insights/compute-insights.ts` | Adapté au modèle projet |

---

## Documentation

- **Ajout** : `.env.example` (`API_URL`, Firebase, `NEXT_PUBLIC_REQUIRE_AUTH`)
- **Mise à jour** : `README.md` — architecture API, proxy, déploiement Cloud Run, note Bearer JWT non branché

---

## Inventaire fichiers (git status)

**Modifiés (42)** — voir `git diff --name-only HEAD`

**Supprimés (5)**

- 4 routes BFF campagnes
- `hooks/use-sync-project-campaign-selection.ts`

**Ajoutés (7)**

- `.env.example`
- 3 routes BFF projet (performances, strategy, monitoring)
- `hooks/use-project-context.ts`
- `hooks/use-sync-project-selection.ts`

**Statistiques** : 46 fichiers, +327 / −1 807 lignes

---

## Écarts restants (post-migration)

| Point | Détail |
|---|---|
| **Prod non déployée** | Le [dashboard live](https://admin-531732557398.europe-west1.run.app/dashboard) utilise encore l’ancien modèle campagnes |
| **Textes UI** | Messages vides « projet / campagne » ; `site.config.ts` mentionne encore « campagnes » |
| **Bearer JWT** | OpenAPI l’exige ; front ne l’envoie pas (documenté README — OK tant que staging est ouvert) |
| **`API_URL` dans BFF** | Routes BFF n’ont pas encore le garde-fou `startsWith("http")` du proxy |
| **`project-campaign`** | Type conservé dans `types/workspace.ts` pour compatibilité |

---

## Déploiement recommandé

1. Committer tous les changements locaux
2. Pousser sur la branche suivie par le trigger Cloud Build
3. Vérifier `API_URL` en Cloud Run (URL complète ou absent → fallback staging)
4. Tester : clients, projets, dashboard, performances/stratégie/monitoring avec et sans période
5. Corriger les textes « campagne » restants en polish

---

## Référence OpenAPI — couverture endpoints

| Endpoint | Front |
|---|---|
| `GET/POST /clients` | OK |
| `GET/DELETE /clients/{id}` | OK |
| `GET/POST /clients/{id}/projects` | OK |
| `GET/DELETE /projects/{id}` | OK |
| `PUT /projects/{id}/keywords` | OK |
| `GET /projects/{id}/performances?from&to` | OK |
| `GET /projects/{id}/strategy?from&to` | OK |
| `GET /projects/{id}/monitoring?from&to` | OK |
| `GET /sites` | OK |
| `/campaigns/*` | Supprimé (intentionnel) |
