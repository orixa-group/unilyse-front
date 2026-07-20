import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { ROUTES } from "@/lib/constants/routes";

const PUBLIC_PATHS = new Set<string>([ROUTES.HOME, ROUTES.SIGN_IN, ROUTES.SIGN_UP]);

function isStrictAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
}

export function middleware(request: NextRequest) {
  if (!isStrictAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/api/auth/session")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const signInUrl = new URL(ROUTES.SIGN_IN, request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/performances/:path*",
    "/strategie/:path*",
    "/monitoring/:path*",
    "/api/bff/:path*",
    "/api/unilize/:path*",
  ],
};
