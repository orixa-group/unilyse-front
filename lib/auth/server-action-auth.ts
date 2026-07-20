import "@/lib/auth/register-server-auth.server";
import { getServerAuthTokenFromCookies } from "@/lib/auth/server-token";
import { runWithAuthToken } from "@/lib/auth/request-auth-context.server";

export async function runAuthenticatedServerAction<T>(
  handler: () => Promise<T>,
  onUnauthenticated: () => T,
): Promise<T> {
  const token = await getServerAuthTokenFromCookies();
  if (!token) return onUnauthenticated();
  return runWithAuthToken(token, handler);
}
