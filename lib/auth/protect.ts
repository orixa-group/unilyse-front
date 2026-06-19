import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Garde serveur désactivée tant que l’accès est ouvert.
 * À brancher plus tard (session Firebase / cookie) quand la connexion sera obligatoire.
 */
export async function requireAuth(): Promise<void> {
  return;
}

/**
 * @deprecated Accès ouvert — ne redirige pas pour l’instant.
 */
export async function getCurrentUserOrRedirect(): Promise<null> {
  return null;
}

/** Active la redirection vers sign-in si cette variable est à "true". */
export function isStrictAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
}

export async function requireAuthIfEnabled(): Promise<void> {
  if (!isStrictAuthEnabled()) return;
  redirect(ROUTES.SIGN_IN);
}
