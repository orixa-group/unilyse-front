import { NextRequest, NextResponse } from "next/server";
import { UNILIZE_API_DEFAULT_URL } from "@/lib/constants/api-endpoints";
import { logUnilizeEvent } from "@/lib/unilize/request-log";

export const dynamic = "force-dynamic";

function getUpstreamBase(): string {
  const serverUrl = process.env.API_URL?.trim();
  if (serverUrl?.startsWith("http")) {
    return serverUrl.replace(/\/$/, "");
  }
  return UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamPath = `/${path.join("/")}`;
  const url = new URL(upstreamPath, getUpstreamBase());
  url.search = request.nextUrl.search;

  const method = request.method;
  const startedAt = Date.now();

  logUnilizeEvent("bff", "start", `${method} /api/unilize${upstreamPath}`, {
    upstream: url.toString(),
  });

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("Accept", accept);
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const upstream = await fetch(url.toString(), { method, headers, body });
    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) {
      responseHeaders.set("Content-Type", upstreamContentType);
    }

    logUnilizeEvent("bff", upstream.ok ? "success" : "error", `${method} /api/unilize${upstreamPath}`, {
      upstream: url.toString(),
      status: upstream.status,
      durationMs: Date.now() - startedAt,
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logUnilizeEvent("bff", "error", `${method} /api/unilize${upstreamPath}`, {
      upstream: url.toString(),
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Impossible de joindre l’API Unilize." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
