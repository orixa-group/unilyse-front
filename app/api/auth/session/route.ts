import { NextResponse } from "next/server";
import {
  isValidSessionToken,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session-cookie";

export const dynamic = "force-dynamic";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function POST(request: Request) {
  let body: { idToken?: string };
  try {
    body = (await request.json()) as { idToken?: string };
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const idToken = body.idToken?.trim();
  if (!isValidSessionToken(idToken)) {
    return NextResponse.json({ error: "Token manquant." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, idToken, sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
