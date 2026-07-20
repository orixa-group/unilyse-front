import "@/lib/auth/register-server-auth.server";
import { NextResponse } from "next/server";
import { getServerAuthTokenFromRequest } from "@/lib/auth/server-token";
import { runWithAuthToken } from "@/lib/auth/request-auth-context.server";

export async function withBffAuth<T>(
  request: Request,
  handler: () => Promise<T>,
): Promise<T | NextResponse> {
  const token = getServerAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  return runWithAuthToken(token, handler);
}
