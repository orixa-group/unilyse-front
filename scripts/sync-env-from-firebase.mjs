/**
 * Met à jour .env.local avec config/firebase.public.json (dev local).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(resolve(root, "config/firebase.public.json"), "utf8"),
);
const envPath = resolve(root, ".env.local");
const examplePath = resolve(root, ".env.example");

let base = existsSync(envPath)
  ? readFileSync(envPath, "utf8")
  : readFileSync(examplePath, "utf8");

const replacements: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: config.measurementId ?? "",
  NEXT_PUBLIC_REQUIRE_AUTH: "true",
};

for (const [key, value] of Object.entries(replacements)) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(base)) {
    base = base.replace(pattern, `${key}=${value}`);
  } else {
    base += `\n${key}=${value}`;
  }
}

writeFileSync(envPath, base.endsWith("\n") ? base : `${base}\n`, "utf8");
console.log(`Mis à jour : ${envPath}`);
