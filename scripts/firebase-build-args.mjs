/**
 * Lit config/firebase.public.json pour les builds Docker prod.
 *
 * Modes :
 *   node scripts/firebase-build-args.mjs              → lignes `echo --build-arg …` (eval local)
 *   node scripts/firebase-build-args.mjs --write-env <fichier>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "config/firebase.public.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

const apiUrl =
  process.env.API_URL?.trim() ||
  "https://public-api-531732557398.europe-west9.run.app";

const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH?.trim() || "true";

const envEntries = {
  API_URL: apiUrl,
  NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: config.measurementId ?? "",
  NEXT_PUBLIC_REQUIRE_AUTH: requireAuth,
};

const writeEnvPath = process.argv[2] === "--write-env" ? process.argv[3] : null;

if (writeEnvPath) {
  const body = Object.entries(envEntries)
    .map(([key, value]) => `${key}=${String(value).replace(/\n/g, "")}`)
    .join("\n");
  writeFileSync(writeEnvPath, `${body}\n`, "utf8");
  process.exit(0);
}

for (const [key, value] of Object.entries(envEntries)) {
  const escaped = String(value).replace(/'/g, `'\\''`);
  process.stdout.write(`echo --build-arg ${key}='${escaped}'\n`);
}
