import "@/lib/auth/register-server-auth.server";
import { NextResponse } from "next/server";
import { getApiErrorMessage } from "@/lib/api/bff-route-utils";
import { getServerAuthTokenFromRequest } from "@/lib/auth/server-token";
import { runWithAuthToken } from "@/lib/auth/request-auth-context.server";
import { logUnilizeEvent } from "@/lib/unilize/request-log";

export async function withBffAuth<T>(
  request: Request,
  handler: () => Promise<T>,
): Promise<T | NextResponse> {
  const token = getServerAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    return await runWithAuthToken(token, handler);
  } catch (error) {
    const message = getApiErrorMessage(error);
    logUnilizeEvent("bff", "error", "Unhandled BFF route error", {
      message,
    });
    return NextResponse.json(
      { error: message || "Erreur interne du serveur BFF." },
      { status: 500 },
    );
  }
}
