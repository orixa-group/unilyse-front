import firebaseDefaults from "@/config/firebase.public.json";
import type { FirebasePublicConfig } from "@/lib/firebase/types";

const defaultConfig = firebaseDefaults as FirebasePublicConfig;

function readFirebaseEnv(
  envKey: keyof FirebasePublicConfig,
  fallback: string | undefined,
): string {
  const envMap: Record<keyof FirebasePublicConfig, string | undefined> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  return envMap[envKey]?.trim() || fallback?.trim() || "";
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const apiKey = readFirebaseEnv("apiKey", defaultConfig.apiKey);
  const authDomain = readFirebaseEnv("authDomain", defaultConfig.authDomain);
  const projectId = readFirebaseEnv("projectId", defaultConfig.projectId);
  const storageBucket = readFirebaseEnv(
    "storageBucket",
    defaultConfig.storageBucket,
  );
  const messagingSenderId = readFirebaseEnv(
    "messagingSenderId",
    defaultConfig.messagingSenderId,
  );
  const appId = readFirebaseEnv("appId", defaultConfig.appId);

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  const measurementId = readFirebaseEnv(
    "measurementId",
    defaultConfig.measurementId,
  );

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebasePublicConfig() !== null;
}

export type { FirebasePublicConfig };
