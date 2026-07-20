"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants/routes";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading, configured } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (configured && !user) {
      router.replace(ROUTES.SIGN_IN);
    }
  }, [configured, user, loading, router]);

  if (!configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true">
        <LoadingSkeleton className="h-10 w-full max-w-2xl" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 p-6" aria-busy="true">
        <LoadingSkeleton className="h-10 w-full max-w-2xl" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
