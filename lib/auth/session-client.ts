export async function syncAuthSession(idToken: string): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Impossible de synchroniser la session.");
  }
}

export async function clearAuthSession(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  });
}
