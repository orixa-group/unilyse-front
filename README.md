# Unilyse

Application Next.js interne.

## Démarrage local

```bash
npm install
npm run dev
```

Copier `.env.example` vers `.env.local` et renseigner les variables.

[http://localhost:3000](http://localhost:3000)

## Variables d’environnement

| Variable | Local | Docker / Cloud Run |
|---|---|---|
| `API_URL` | `.env.local` | `--build-arg` **et** `--set-env-vars` au déploiement |
| `NEXT_PUBLIC_FIREBASE_*` | `.env.local` | `--build-arg` au `docker build` |
| `NEXT_PUBLIC_REQUIRE_AUTH` | `.env.local` | `--build-arg` (optionnel) |

Les variables `NEXT_PUBLIC_*` sont figées dans le bundle au moment du **build**.  
`API_URL` sert aussi aux rewrites Next.js au build, et aux appels serveur au **runtime**.

## Déploiement Google Cloud (Cloud Run)

Prérequis : Artifact Registry, APIs Cloud Build et Cloud Run activées.

```bash
# Créer le dépôt d’images (une fois)
gcloud artifacts repositories create unilyse-admin \
  --repository-format=docker \
  --location=europe-west9

# Build + déploiement via Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

Pour surcharger l’URL API ou les clés Firebase au build :

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL=https://votre-api.run.app,_NEXT_PUBLIC_FIREBASE_API_KEY=...
```

Build Docker manuel :

```bash
docker build \
  --build-arg API_URL=https://public-api-531732557398.europe-west9.run.app \
  -t unilyse-admin .
```
