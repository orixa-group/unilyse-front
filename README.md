# Unilyse

Application Next.js interne — front de l’API Unilize (portfolio + analytics projet).

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Renseigner API_URL (et Firebase si besoin)
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Variables d’environnement

| Variable | Local | Docker / Cloud Run |
|---|---|---|
| `API_URL` | `.env.local` | `--set-env-vars` au déploiement Cloud Run (runtime) |
| `NEXT_PUBLIC_FIREBASE_*` | `.env.local` ou copie de `config/firebase.public.json` | **Build** : lu depuis `config/firebase.public.json` (commité, config publique) |
| `NEXT_PUBLIC_REQUIRE_AUTH` | `.env.local` (`true` recommandé) | `true` par défaut dans Cloud Build |

Les variables `NEXT_PUBLIC_*` sont figées dans le bundle au moment du **build**.  
`API_URL` est lue au **runtime** par les routes BFF et le proxy `/api/unilize/*`.

**Config Firebase prod** : [`config/firebase.public.json`](config/firebase.public.json) — valeurs publiques par design Firebase, versionnées dans le repo (pas de Secret Manager nécessaire côté front).

Référence OpenAPI : `{API_URL}/openapi.yaml`

## Authentification

L’API Unilize exige un **Bearer JWT** (token Firebase ID). Le front :

1. Connecte l’utilisateur via Firebase (email / mot de passe) sur `/sign-in`
2. Synchronise le token dans un cookie httpOnly (`POST /api/auth/session`)
3. Transmet le token aux routes BFF, au proxy `/api/unilize` et aux Server Actions

Variables Firebase à récupérer depuis la console Firebase (app Web) ou l’app admin déployée par l’équipe back.  
En prod, la source de vérité commitée est [`config/firebase.public.json`](config/firebase.public.json).

Dans Firebase Console : activer **Email/Password** et **désactiver l’inscription libre** (comptes créés par l’admin).

Les comptes utilisateurs sont créés dans Firebase → **Authentication** → **Users** → **Add user**.

## Architecture API

- Portfolio : clients, projets, mots-clés (`PUT /projects/{id}/keywords` déclenche la sync).
- Analytics au **niveau projet** : `/projects/{id}/performances|strategy|monitoring` (query optionnelle `from` / `to`).
- Le navigateur appelle `/api/unilize/*` (proxy) ou `/api/bff/*` (lectures enrichies), avec cookie de session Firebase.

## Déploiement Google Cloud (Cloud Run)

Prérequis : Artifact Registry, APIs Cloud Build et Cloud Run activées.

```bash
# Build + déploiement via Cloud Build (Firebase lu depuis config/firebase.public.json)
gcloud builds submit --config cloudbuild.yaml .
```

Pour surcharger l’URL API :

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL=https://votre-api.run.app
```

Build Docker local (prod) :

```bash
chmod +x scripts/docker-build-prod.sh
./scripts/docker-build-prod.sh unilyse-admin
```

Build Docker manuel (sans script) :

```bash
docker build \
  --build-arg API_URL=https://public-api-531732557398.europe-west9.run.app \
  -t unilyse-admin .
```
