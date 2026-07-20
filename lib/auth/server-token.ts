import { cookies } from "next/headers";
import {
  isValidSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session-cookie";

function readBearerFromAuthorizationHeader(
  authorization: string | null,
): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return isValidSessionToken(token) ? token : null;
}

export function getServerAuthTokenFromRequest(request: Request): string | null {
  const fromHeader = readBearerFromAuthorizationHeader(
    request.headers.get("authorization"),
  );
  if (fromHeader) return fromHeader;

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === SESSION_COOKIE_NAME) {
      const value = rest.join("=").trim();
      return isValidSessionToken(value) ? decodeURIComponent(value) : null;
    }
  }

  return null;
}

export async function getServerAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionToken(value) ? value : null;
}
