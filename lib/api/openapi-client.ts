import { UNILIZE_API_DEFAULT_URL } from "@/lib/constants/api-endpoints";

export async function fetchOpenApiSpec(): Promise<string> {
  const base =
    process.env.API_URL?.replace(/\/$/, "") ??
    UNILIZE_API_DEFAULT_URL;
  const response = await fetch(`${base}/openapi.yaml`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
