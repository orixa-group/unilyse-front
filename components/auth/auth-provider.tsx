"use client";

import {
  onAuthStateChanged,
  onIdTokenChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clearAuthSession, syncAuthSession } from "@/lib/auth/session-client";
import { ROUTES } from "@/lib/constants/routes";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, (nextUser) => {
      if (!nextUser) return;
      void nextUser
        .getIdToken()
        .then((token) => syncAuthSession(token))
        .catch(() => {
          /* ignore sync errors — middleware will block if cookie missing */
        });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [configured]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthSession();
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    router.push(ROUTES.SIGN_IN);
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, configured, signOut, getIdToken }),
    [user, loading, configured, signOut, getIdToken],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return ctx;
}
