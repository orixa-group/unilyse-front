import { ROUTES } from "@/lib/constants/routes";

export function redirectToSignIn(): void {
  if (typeof window === "undefined") return;

  const pathname = window.location.pathname;
  if (pathname === ROUTES.SIGN_IN || pathname === ROUTES.SIGN_UP) return;

  const next = pathname + window.location.search;
  window.location.href = `${ROUTES.SIGN_IN}?next=${encodeURIComponent(next)}`;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("401") ||
    message.includes("non authentifié") ||
    message.includes("non authentifie")
  );
}
