import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ROUTES } from "@/lib/constants/routes";
import {
  isValidSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session-cookie";

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    redirect(ROUTES.SIGN_IN);
  }
}

export async function getCurrentUserOrRedirect(): Promise<null> {
  await requireAuth();
  return null;
}

export function isStrictAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
}

export async function requireAuthIfEnabled(): Promise<void> {
  if (!isStrictAuthEnabled()) return;
  await requireAuth();
}
