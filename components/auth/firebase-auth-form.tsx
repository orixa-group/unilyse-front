"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { ROUTES } from "@/lib/constants/routes";

type FirebaseAuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function FirebaseAuthForm({ mode }: FirebaseAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isFirebaseConfigured()) {
    return (
      <div className="text-muted-foreground max-w-md space-y-3 text-center text-sm">
        <p>
          Firebase n&apos;est pas encore activé.
        </p>
        <p>
          L&apos;application reste accessible sans connexion.
        </p>
        <Button variant="outline" asChild>
          <Link href={ROUTES.DASHBOARD}>Continuer sans connexion</Link>
        </Button>
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
      if (mode === "sign-in") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur d'authentification";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  const title = mode === "sign-in" ? "Connexion" : "Créer un compte";
  const alternate =
    mode === "sign-in"
      ? { href: ROUTES.SIGN_UP, label: "Créer un compte" }
      : { href: ROUTES.SIGN_IN, label: "Se connecter" };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Firebase Authentication (optionnel)
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
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
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
          {pending ? "Chargement…" : title}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link href={alternate.href} className="text-foreground underline">
          {alternate.label}
        </Link>
        {" · "}
        <Link href={ROUTES.DASHBOARD} className="underline">
          Accès sans connexion
        </Link>
      </p>
    </div>
  );
}
