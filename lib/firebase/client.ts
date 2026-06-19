import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirebasePublicConfig } from "@/lib/firebase/config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebasePublicConfig();
  if (!config) return null;

  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}
