import { buildUnilizeUpstreamUrl } from "@/lib/api/resolve-server-api-url";

export async function fetchOpenApiSpec(): Promise<string> {
  const response = await fetch(buildUnilizeUpstreamUrl("/openapi.yaml"), {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
