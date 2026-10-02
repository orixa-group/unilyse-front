# Migration de l'API Unilize — v1 → v2

Ce document liste tout ce qui change entre l'ancienne API et la nouvelle. Les
points marqués ⚠️ cassent le code existant en silence : la requête part, la
réponse arrive, mais la donnée n'a plus la même forme ou la même unité.

La documentation complète de la nouvelle API se lit sur `/docs`, et le
descripteur OpenAPI se télécharge sur `/openapi.yaml`.

- [Les routes en un coup d'œil](#les-routes-en-un-coup-dœil)
- [Changements transverses](#changements-transverses)
- [Routes de métriques, avant / après](#routes-de-métriques-avant--après)
- [Autres routes](#autres-routes)
- [Ce qui disparaît sans remplacement](#ce-qui-disparaît-sans-remplacement)
- [Checklist](#checklist)

## Les routes en un coup d'œil

| Ancienne route | Nouvelle route | |
|---|---|---|
| `GET /clients` | inchangée | |
| `POST /clients` | inchangée | |
| `GET /clients/{id}` | inchangée | |
| — | `PUT /clients/{id}` | nouvelle : renommer un client |
| `DELETE /clients/{id}` | inchangée | ⚠️ ne répond plus `404` |
| `GET /clients/{id}/projects` | inchangée | ⚠️ champs du projet renommés |
| `POST /clients/{id}/projects` | inchangée | ⚠️ corps renommé, plus de `409` |
| `GET /projects/{id}` | inchangée | ⚠️ ne renvoie plus les mots-clés |
| `DELETE /projects/{id}` | inchangée | ⚠️ ne répond plus `404` |
| — | `GET /projects/{id}/keywords` | nouvelle : lire les mots-clés |
| `PUT /projects/{id}/keywords` | inchangée | ⚠️ `theme` obligatoire |
| `GET /projects/{id}/themes` | inchangée | |
| `GET /projects/{id}/performances` | inchangée | ⚠️ réponse refaite |
| `GET /projects/{id}/timeline` | `GET /projects/{id}/summary` | ⚠️ réponse refaite |
| `GET /projects/{id}/timeline/traffic` | `GET /projects/{id}/traffic` | ⚠️ réponse refaite |
| `GET /projects/{id}/timeline/ctr-budget` | `GET /projects/{id}/clicks` | ⚠️ réponse refaite |
| `GET /sites` | `GET /search-console/properties` | |
| — | `GET /google-ads/accounts` | nouvelle : les comptes Google Ads |
| `GET /projects/{id}/strategy` | supprimée | remplacée en partie par `GET /projects/{id}/recommendations` |
| — | `GET /projects/{id}/recommendations` | nouvelle : `ProjectRecommendations` (keywords, summary, matrix, gaps ; query `date`) |
| `POST /projects/{id}/decisions` | supprimée | |
| `GET /projects/{id}/monitoring` | supprimée | |
| `POST /projects/{id}/refresh` | supprimée | |

Ce qui ne bouge pas : l'authentification (jeton Firebase en `Authorization:
Bearer`), l'enveloppe `{"data": …}` des succès et `{"error": {"message": …}}`
des erreurs, l'en-tête `X-Request-ID`, et les identifiants KSUID. L'ancienne
documentation écrivait `{projectId}` là où la nouvelle écrit `{id}` : l'URL
appelée est la même.

## Changements transverses

### ⚠️ La période devient obligatoire, et `to` devient `until`

Avant, `from` et `to` étaient facultatifs : sans eux, l'API répondait sur le
mois glissant finissant hier. Maintenant, `from` et `until` sont **requis** sur
les quatre routes de métriques, au format `2006-01-02`, bornes incluses, et
`until` ne doit pas précéder `from`.

```diff
- GET /projects/{id}/performances
- GET /projects/{id}/performances?from=2026-08-01&to=2026-08-31
+ GET /projects/{id}/performances?from=2026-08-01&until=2026-08-31
```

Un appel sans période répondait `200`, il répond désormais `400` :

```json
{"error": {"message": "from must be a date, written 2006-01-02"}}
```

C'est au front de choisir la période par défaut qu'affichait l'API.

### ⚠️ Les taux passent du pourcentage à la fraction

Tous les taux valent maintenant entre 0 et 1. Un `3.24` devient `0.0324` : il
faut multiplier par 100 à l'affichage.

| Champ | Avant | Après |
|---|---|---|
| `ctr` (SEA, SEO, global) | `3.0` | `0.03` |
| `conversion_rate` | `5.0` | `0.05` |
| `no_click_rate` | `91.9` | `0.919` |
| `conversions_share` → `conversion_share` | `71.4` | `0.714` |

Les parts d'impressions perdues, `search_budget_lost_impression_share` et
`search_rank_lost_impression_share`, étaient déjà des fractions : elles ne
changent pas.

### ⚠️ `sea` et `seo` deviennent `paid` et `organic`

Partout dans les réponses. Dans les performances par mot-clé, les blocs
s'appellent `paid_performances` et `organic_performances`.

### ⚠️ Tout bloc d'observation peut être `null`

Avant, seul `sea` pouvait valoir `null` ; `seo` et `search_volume` renvoyaient
des zéros quand rien n'avait été observé, ce qui ne se distinguait pas d'un
vrai zéro. Maintenant, les six blocs valent `null` tant que rien n'est connu,
et l'affichage doit traiter le cas.

### ⚠️ La collecte en cours change de nom et d'états

`status` devient `acquisitions`, ses clés changent, et ses valeurs passent de
deux à quatre, plus `null` quand rien n'a jamais été demandé.

| Avant | Après |
|---|---|
| `status.sea` | `acquisitions.paid_performances` |
| `status.seo` | `acquisitions.organic_performances` |
| `status.search_volume` | `acquisitions.search_volumes` |
| `status.organic_ranking` | `acquisitions.organic_rankings` |
| `status.url_authority` | `acquisitions.url_authorities` |
| `status.semantic` | `acquisitions.page_semantics` |
| `in_progress` \| `completed` | `pending` \| `running` \| `succeeded` \| `failed` \| `null` |

Pour garder l'indicateur « collecte en cours » : `pending` et `running`
remplacent `in_progress`, `succeeded` et `failed` remplacent `completed`, et
`failed` permet enfin de montrer qu'une collecte a échoué.

### Champs renommés, hors blocs

| Avant | Après |
|---|---|
| `spend` | `cost` |
| `no_click_count` | `no_clicks` |
| `average_score`, `max_score`, `min_score` | `average`, `max`, `min`, sous `competitors` |
| `url` (projet) | `search_console_url` |
| `customer_id` (projet) | `gads_customer_id` |

## Routes de métriques, avant / après

### `GET /projects/{id}/performances`

Même route, réponse refaite. Toujours une entrée par mot-clé du projet, dans
l'ordre où ils ont été enregistrés.

**Avant** — `GET /projects/{id}/performances?from=&to=`

```json
{
  "data": [
    {
      "keyword": "café en grain",
      "sea": {
        "impressions": 12500,
        "clicks": 375,
        "spend": 562.50,
        "conversions": 18.5,
        "conversion_value": 2775.00,
        "quality_score": 7,
        "search_budget_lost_impression_share": 0.18,
        "search_rank_lost_impression_share": 0.14,
        "ad_relevance": "ABOVE_AVERAGE",
        "expected_ctr": "AVERAGE",
        "landing_page_ux": "AVERAGE",
        "ctr": 3.0,
        "cpc": 0.72,
        "conversion_rate": 5.0,
        "cost_per_conversion": 14.40,
        "roas": 3.47,
        "potential_impressions_with_full_budget": 1285.71,
        "potential_impressions_with_full_rank": 1142.86
      },
      "search_volume": { "volume": 49500 },
      "seo": {
        "impressions": 8400,
        "clicks": 252,
        "ctr": 3.0,
        "average_position": 4.7,
        "real_time_position": 4,
        "netlinking_competitors": { "average_score": 62.4, "max_score": 78, "min_score": 40 },
        "semantic_competitors":   { "average_score": 71.2, "max_score": 88, "min_score": 55 }
      },
      "status": {
        "sea": "completed",
        "seo": "completed",
        "search_volume": "completed",
        "organic_ranking": "in_progress",
        "url_authority": "in_progress",
        "semantic": "completed"
      },
      "no_click_rate": 91.9
    }
  ]
}
```

**Après** — `GET /projects/{id}/performances?from=&until=`

```json
{
  "data": [
    {
      "keyword": "café en grain",
      "paid_performances": {
        "impressions": 12500,
        "clicks": 375,
        "cost": 562.50,
        "conversions": 18.5,
        "conversion_value": 2775.00,
        "quality_score": 7,
        "search_budget_lost_impression_share": 0.18,
        "search_rank_lost_impression_share": 0.14,
        "ad_relevance": "ABOVE_AVERAGE",
        "expected_ctr": "AVERAGE",
        "landing_page_ux": "AVERAGE",
        "ctr": 0.03,
        "cpc": 0.72,
        "conversion_rate": 0.05,
        "cost_per_conversion": 14.40,
        "roas": 3.47,
        "potential_impressions_with_full_budget": 1285.71,
        "potential_impressions_with_full_rank": 1142.86
      },
      "organic_performances": {
        "impressions": 8400,
        "clicks": 252,
        "ctr": 0.03,
        "average_position": 4.7
      },
      "search_volume": { "volume": 49500 },
      "organic_ranking": { "position": 4 },
      "url_authorities": { "competitors": { "average": 62.4, "max": 78, "min": 40 } },
      "page_semantics":  { "competitors": { "average": 71.2, "max": 88, "min": 55 } },
      "no_click_rate": 0.919,
      "acquisitions": {
        "paid_performances": "succeeded",
        "organic_performances": "succeeded",
        "search_volumes": "succeeded",
        "organic_rankings": "running",
        "url_authorities": "pending",
        "page_semantics": "succeeded"
      }
    }
  ]
}
```

Ce qui change, point par point :

- `sea` → `paid_performances`, `seo` → `organic_performances`, `status` → `acquisitions`.
- ⚠️ `spend` → `cost`.
- ⚠️ `ctr`, `conversion_rate` et `no_click_rate` sont des fractions.
- ⚠️ `no_click_rate` vaut `null` quand le volume est inconnu ou nul, là où il valait `0`.
- ⚠️ `real_time_position` quitte le bloc SEO : c'est `organic_ranking.position`, qui vaut `null` quand le projet ne se classe pas. Le bloc `organic_ranking` entier vaut `null` quand aucune page de résultats n'a encore été observée.
- ⚠️ `netlinking_competitors` → `url_authorities`, `semantic_competitors` → `page_semantics`, tous deux sortis du bloc SEO, avec leurs scores sous `competitors` et renommés `average` / `max` / `min`.
- ⚠️ `ad_relevance`, `expected_ctr` et `landing_page_ux` valent `null` quand Google n'a pas noté, là où ils valaient `"UNSPECIFIED"` ou `"UNKNOWN"`. Les trois autres valeurs ne changent pas.
- ⚠️ Chacun des six blocs vaut `null` quand rien n'est connu, `search_volume` et `organic_performances` compris.

### `GET /projects/{id}/timeline` → `GET /projects/{id}/summary`

**Avant**

```json
{
  "data": {
    "global": {
      "keyword_count": 24,
      "search_volume": 154000,
      "ctr": 3.24,
      "no_click_count": 149000,
      "conversions": 42.0
    },
    "sea": { "clicks": 3200, "conversions": 30.0, "conversions_share": 71.4 },
    "seo": { "clicks": 1800, "conversions": 12.0, "conversions_share": 28.6 },
    "decisions": [
      {
        "id": "2cFQKWmMXlm1vLPuFLe2M5BkNEV",
        "keyword": "café en grain",
        "applied": "SEA",
        "recommended": "SEO",
        "justification": "…",
        "decided_by": "…",
        "decided_at": "2026-08-17T09:24:31Z",
        "created_at": "2026-08-17T09:24:31Z",
        "updated_at": "2026-08-17T09:24:31Z"
      }
    ]
  }
}
```

**Après**

```json
{
  "data": {
    "global": {
      "keyword_count": 24,
      "search_volume": 154000,
      "ctr": 0.0324,
      "no_clicks": 149000,
      "conversions": 42.0
    },
    "paid":    { "clicks": 3200, "conversions": 30.0, "conversion_share": 0.714 },
    "organic": { "clicks": 1800, "conversions": 12.0, "conversion_share": 0.286 }
  }
}
```

- ⚠️ `sea` → `paid`, `seo` → `organic`.
- ⚠️ `no_click_count` → `no_clicks`.
- ⚠️ `conversions_share` → `conversion_share`, au singulier, et en fraction.
- ⚠️ `global.ctr` en fraction.
- ⚠️ `decisions` disparaît, avec le reste du moteur de recommandation.

### `GET /projects/{id}/timeline/traffic` → `GET /projects/{id}/traffic`

Toujours une entrée par jour calendaire de la période, les jours sans donnée à
zéro.

**Avant**

```json
{
  "data": [
    {
      "date": "2026-08-17",
      "global": { "conversions": 5.0 },
      "sea": { "clicks": 108, "sessions": 95, "conversions": 4.0 },
      "seo": { "clicks": 62,  "sessions": 54, "conversions": 1.0 }
    }
  ]
}
```

**Après**

```json
{
  "data": [
    {
      "date": "2026-08-17",
      "global":  { "sessions": 149, "conversions": 5.0 },
      "paid":    { "clicks": 108, "sessions": 95, "conversions": 4.0 },
      "organic": { "clicks": 62,  "sessions": 54, "conversions": 1.0 }
    }
  ]
}
```

- ⚠️ `sea` → `paid`, `seo` → `organic`.
- `global` porte désormais `sessions`, la somme des deux canaux de la recherche.

### `GET /projects/{id}/timeline/ctr-budget` → `GET /projects/{id}/clicks`

Les filtres `keyword` et `theme` ne changent pas : répétables, facultatifs, et
combinés en union — les mots-clés nommés, plus ceux des thèmes nommés. Sans
aucun des deux, tous les mots-clés du projet sont comptés.

**Avant**

```json
{
  "data": [
    {
      "date": "2026-08-17",
      "global": { "ctr": 3.24 },
      "sea": { "clicks": 108, "cost": 42.3 },
      "seo": { "clicks": 62 }
    }
  ]
}
```

**Après**

```json
{
  "data": [
    {
      "date": "2026-08-17",
      "global":  { "ctr": 0.0324 },
      "paid":    { "clicks": 108, "cost": 42.3 },
      "organic": { "clicks": 62 }
    }
  ]
}
```

- ⚠️ `sea` → `paid`, `seo` → `organic`.
- ⚠️ `global.ctr` en fraction.

## Autres routes

### Clients

`GET /clients`, `POST /clients` et `GET /clients/{id}` ne changent pas : un
client est toujours `{id, name, created_at, updated_at}`, et créer un client
du nom d'un autre répond toujours `409`.

**Nouveau** — `PUT /clients/{id}` renomme un client :

```http
PUT /clients/2cFQKWmMXlm1vLPuFLe2M5BkNEV
{"name": "Acme"}
```

Il répond le client renommé, `404` s'il n'existe pas, `400` pour un nom vide,
`409` pour un nom qu'un autre client porte déjà.

⚠️ `DELETE /clients/{id}` ne répond plus `404` : supprimer un client qui
n'existe pas répond `204`, comme supprimer celui qui existe. Le front n'a plus
à traiter le `404` de cette route.

### Projets

⚠️ Les champs du projet sont renommés, et deux deviennent facultatifs à la
création.

| Avant | Après | |
|---|---|---|
| `url` | `search_console_url` | la propriété Search Console, telle que Search Console la nomme : `sc-domain:exemple.fr` ou `https://www.exemple.fr/`, et non plus une URL quelconque |
| `customer_id` | `gads_customer_id` | inchangé quant au contenu |
| `ga4_property_id` | `ga4_property_id` | devient facultatif : un projet peut n'avoir pas de Google Analytics, et n'a alors ni session ni conversion |
| `ctr_benchmark` | `ctr_benchmark` | devient facultatif, et `0` est accepté ; toujours un pourcentage entre 0 et 100 |
| `name` | `name` | inchangé |

```http
POST /clients/{id}/projects
{
  "name": "acme.com",
  "search_console_url": "sc-domain:acme.com",
  "gads_customer_id": "1234567890",
  "ga4_property_id": "312345678",
  "ctr_benchmark": 4.5
}
```

⚠️ La création de projet ne répond plus `409` : deux projets d'un même client
peuvent porter le même nom.

⚠️ `DELETE /projects/{id}` ne répond plus `404`, comme pour les clients.

⚠️ `GET /projects/{id}` ne renvoie plus les mots-clés du projet. C'est le
changement à traiter en même temps que la nouvelle route ci-dessous.

### Mots-clés

**Nouveau** — `GET /projects/{id}/keywords` répond les mots-clés du projet,
dans l'ordre où ils ont été enregistrés :

```json
{"data": [{"value": "café en grain", "theme": "boissons"}]}
```

C'est par là que passe ce que `GET /projects/{id}` portait sous `keywords`.

⚠️ `PUT /projects/{id}/keywords` exige désormais un `theme` sur chaque
mot-clé. Un mot-clé sans thème était accepté, il répond maintenant `400` :

```json
{"error": {"message": "portfolio: keywords without a theme at 2"}}
```

Le message nomme les positions fautives dans le tableau envoyé, en partant
de 0. De même pour les valeurs vides, et pour un doublon :

```json
{"error": {"message": "portfolio: duplicate keywords: café en grain"}}
```

⚠️ Les valeurs sont normalisées avant d'être enregistrées : minuscules,
espaces et apostrophes ramenés à une seule forme. Ce que la route répond peut
donc différer de ce qui a été envoyé — `"L'Hôtel  Paris"` revient
`"l'hôtel paris"` — et c'est la valeur normalisée qu'il faut afficher et
renvoyer. Les accents et les pluriels sont conservés : `café` et `cafe`
restent deux mots-clés.

Le corps reste un tableau JSON nu, et un tableau vide vide le projet. ⚠️ En
revanche `null` est refusé, là où il passait.

`GET /projects/{id}/themes` ne change pas : les thèmes du projet, triés,
chacun une fois.

### `GET /sites` → `GET /search-console/properties`

Les champs ne changent pas — `{url, domain, permission_level}` — et les quatre
niveaux de permission non plus, `siteUnverifiedUser` compris.

Deux différences :

- `domain` est le domaine enregistrable, sous-domaines mis de côté, et non
  plus l'URL débarrassée de son `www.`. Il peut être vide quand aucun domaine
  ne peut être tiré de l'URL.
- Les propriétés sont triées par domaine puis par URL, celles sans domaine en
  dernier, de sorte que les propriétés d'un même site se suivent.

### Nouveau — `GET /google-ads/accounts`

Les comptes Google Ads qu'un projet peut suivre, pour les proposer au choix à
la création d'un projet, comme les propriétés Search Console :

```json
{"data": [{"id": "1234567890", "name": "Exemple FR", "status": "ENABLED"}]}
```

Les comptes administrateurs sont écartés : ils ne diffusent pas d'annonces.
Les autres sont tous listés, quel que soit leur statut, à charge pour le front
de griser ceux qui ne sont pas `ENABLED`. Ils sont triés par nom puis par
identifiant, ceux sans nom en dernier.


> **Note (OpenAPI à jour)** : `GET /projects/{id}/strategy` n'existe plus. Les recommandations par mot-clé passent par **`GET /projects/{id}/recommendations`**. Les écrans **Contenu** / **Netlinking** s'appuient sur `url_authorities`, `page_semantics` et `previous` dans **`GET /projects/{id}/performances`**.

## Ce qui disparaît sans remplacement

L'agrégat `/strategy` et certains écrans dérivés n'ont pas d'équivalent direct :

| Route | Ce qu'elle servait |
|---|---|
| `GET /projects/{id}/strategy` | tableau comparatif 24 colonnes, matrice d'opportunités, gaps sémantiques/netlinking pré-calculés (les reco seules sont sur `/recommendations`) |
| `POST /projects/{id}/decisions` | l'enregistrement d'une décision prise sur un mot-clé |
| `GET /projects/{id}/monitoring` | le suivi concurrentiel par mot-clé |
| `POST /projects/{id}/refresh` | le rafraîchissement à la demande des métriques d'un projet |

Le tableau `decisions` de l'ancien `/timeline` disparaît avec eux.

Les données brutes sur lesquelles ces calculs s'appuyaient restent lisibles :
`GET /projects/{id}/performances` porte, pour chaque mot-clé, les
performances payantes et naturelles, le volume de recherche, le classement, et
les scores d'autorité et de sémantique des concurrents.

## Checklist

1. Ajouter `from` et `until` à chaque appel de `/performances`, `/summary`,
   `/traffic` et `/clicks`, et choisir la période par défaut côté front.
2. Renommer `to` en `until`.
3. Multiplier par 100 à l'affichage tout `ctr`, `conversion_rate`,
   `no_click_rate` et `conversion_share`.
4. Renommer `sea` en `paid` et `seo` en `organic` dans les quatre réponses,
   et en `paid_performances` / `organic_performances` dans les performances.
5. Traiter le `null` de chacun des six blocs d'observation, et celui de
   `no_click_rate`, `organic_ranking.position` et des trois notes de Google.
6. Reprendre l'indicateur de collecte sur `acquisitions` et ses quatre états.
7. Renommer `spend` en `cost`, `no_click_count` en `no_clicks`,
   `conversions_share` en `conversion_share`, et les scores de concurrents en
   `average` / `max` / `min` sous `competitors`.
8. Renommer `url` en `search_console_url` et `customer_id` en
   `gads_customer_id` sur le projet, à la lecture comme à la création.
9. Lire les mots-clés par `GET /projects/{id}/keywords` : `GET /projects/{id}`
   ne les porte plus.
10. Rendre le thème obligatoire dans le formulaire des mots-clés, et afficher
    la valeur normalisée que renvoie la réponse.
11. Retirer le `404` attendu des deux `DELETE`, et le `409` de la création de
    projet.
12. Retirer les écrans de stratégie, de décisions, de monitoring et le bouton
    de rafraîchissement.
13. Brancher le choix de la propriété Search Console sur
    `/search-console/properties`, et celui du compte Google Ads sur
    `/google-ads/accounts`.
