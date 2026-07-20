"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toFirebaseAuthErrorMessage } from "@/lib/auth/firebase-errors";
import { syncAuthSession } from "@/lib/auth/session-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { ROUTES } from "@/lib/constants/routes";

export function FirebaseAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isFirebaseConfigured()) {
    return (
      <div className="text-muted-foreground max-w-md space-y-3 text-center text-sm">
        <p>Firebase n&apos;est pas configuré.</p>
        <p>
          Vérifiez <code>config/firebase.public.json</code> ou les variables{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code> en local.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Initialisation Firebase impossible.");
      setPending(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Impossible de récupérer le token de session.");
      }
      await syncAuthSession(token);

      const next = searchParams.get("next");
      const destination =
        next?.startsWith("/") && !next.startsWith("//")
          ? next
          : ROUTES.DASHBOARD;
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(toFirebaseAuthErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Authentification requise pour accéder à l&apos;application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Chargement…" : "Connexion"}
        </Button>
      </form>
    </div>
  );
}
