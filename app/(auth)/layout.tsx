import { AuthShell } from "@/components/layout/auth-shell";
import { requireAuthIfEnabled } from "@/lib/auth/protect";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthIfEnabled();
  return <AuthShell>{children}</AuthShell>;
}
