# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Config Firebase publique (commitée) — injectée au build Next.js via .env.production.
ARG API_URL
ARG NEXT_PUBLIC_REQUIRE_AUTH=true

RUN node scripts/firebase-build-args.mjs --write-env .env.production \
  && if [ -n "$API_URL" ]; then printf '\nAPI_URL=%s\n' "$API_URL" >> .env.production; fi \
  && if [ -n "$NEXT_PUBLIC_REQUIRE_AUTH" ]; then \
       printf 'NEXT_PUBLIC_REQUIRE_AUTH=%s\n' "$NEXT_PUBLIC_REQUIRE_AUTH" >> .env.production; \
     fi

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# API_URL peut être surchargée au runtime (appels serveur Cloud Run).
# Si absente ou vide, le fallback staging est utilisé (voir resolve-server-api-url.ts).

CMD ["node", "server.js"]
