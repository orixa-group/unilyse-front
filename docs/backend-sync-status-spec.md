# Spécification backend : statut de synchronisation projet

Document de demande d’évolution pour l’API Unilize, à utiliser si l’heuristique front (polling + âge du projet) s’avère insuffisante en production.

## Contexte

À la création d’un projet, l’API publie `project.added` et déclenche :

- sync Google Search Console pour l’URL du projet ;
- sync Google Ads (SEA) pour le `customer_id` du compte.

Le frontend ne dispose aujourd’hui d’**aucun signal explicite** sur l’état de ces synchronisations. Il infère un état « première synchronisation probable » via :

- complétude de la configuration (customer_id, mots-clés, campagne placeholder) ;
- âge du projet (< 48 h) ;
- polling des performances pendant 30 min max.

Cette approche ne permet pas de distinguer une sync **échouée** d’une sync **lente**, ni de remonter des erreurs par source.

## Objectif

Exposer un statut de collecte **par projet**, consommable par le dashboard sans heuristique.

## Option A — Champs sur `Project` / `ProjectDetail`

```yaml
ProjectDetail:
  properties:
    sync_status:
      type: string
      enum: [pending, running, ready, failed]
      description: État global de la première collecte / dernière sync.
    sync_started_at:
      type: string
      format: date-time
      nullable: true
    sync_completed_at:
      type: string
      format: date-time
      nullable: true
    sync_sources:
      type: object
      properties:
        gsc:
          $ref: '#/components/schemas/SyncSourceStatus'
        google_ads:
          $ref: '#/components/schemas/SyncSourceStatus'

SyncSourceStatus:
  type: object
  required: [status]
  properties:
    status:
      type: string
      enum: [pending, running, ready, failed, skipped]
    last_sync_at:
      type: string
      format: date-time
      nullable: true
    error:
      type: string
      nullable: true
      description: Message utilisateur si status=failed.
```

### Sémantique recommandée

| `sync_status` | Signification front |
|---------------|---------------------|
| `pending` | Événement reçu, job pas encore démarré |
| `running` | Collecte en cours |
| `ready` | Au moins une source a produit des données exploitables |
| `failed` | Échec global ou toutes les sources en échec |

Le front mapperait directement :

- `pending` / `running` → badge « Première synchronisation »
- `ready` → badge « Prêt »
- `failed` → badge « Échec de synchronisation » + message `error`

## Option B — Endpoint dédié

```
GET /projects/{id}/sync-status
```

Réponse :

```json
{
  "data": {
    "project_id": "…",
    "status": "running",
    "started_at": "2025-07-02T10:00:00Z",
    "completed_at": null,
    "sources": {
      "gsc": { "status": "running", "last_sync_at": null, "error": null },
      "google_ads": { "status": "pending", "last_sync_at": null, "error": null }
    }
  }
}
```

Avantage : pas de surcharge sur `GET /projects/{id}` ; polling ciblé possible.

## Critères d’acceptation

1. Après `POST /clients/{id}/projects`, le statut initial est `pending` ou `running` (pas `ready` tant qu’aucune donnée n’est ingérée).
2. Transition vers `ready` lorsque des performances/strategy/monitoring deviennent disponibles, ou après critère métier explicite.
3. En cas d’échec OAuth / quota / URL GSC invalide, `failed` + `error` lisible.
4. Documenté dans OpenAPI avec exemples.
5. Idempotent : re-sync manuelle ou `project.keywords.updated` remet `running` puis `ready`/`failed`.

## Consommation front (future)

1. Étendre `UnilizeProjectDetail` avec `sync_status` et `sync_sources`.
2. Remplacer `useProjectsSyncProbe` par lecture du statut API (+ polling léger sur l’endpoint si Option B).
3. Supprimer l’heuristique basée sur l’âge du projet une fois le backend déployé.

## Non-objectifs

- Barre de progression % (nécessite granularité job interne).
- WebSocket / SSE (hors scope initial ; polling 30–60 s suffit).
