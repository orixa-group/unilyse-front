"use client";

import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { useSelectionHydrated } from "@/hooks/use-selection-hydrated";
import { useSelectionStore } from "@/stores/selection.store";
import type { ContextRequirement } from "@/types/workspace";

export function ContextGuard({
  requiresContext,
  children,
}: {
  requiresContext: ContextRequirement;
  children: React.ReactNode;
}) {
  const hasHydrated = useSelectionHydrated();
  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const selectedProjectId = useSelectionStore((s) => s.selectedProjectId);

  if (!hasHydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <LoadingSkeleton className="h-10 w-full max-w-2xl" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (requiresContext !== "none" && !selectedClientId) {
    return (
      <EmptyState
        title="Aucun client sélectionné"
        description="Choisissez un client dans la barre de contexte en haut de page pour commencer l'analyse."
      />
    );
  }

  if (
    (requiresContext === "project" || requiresContext === "project-campaign") &&
    !selectedProjectId
  ) {
    return (
      <EmptyState
        title="Projet requis"
        description="Sélectionnez un projet dans la barre de contexte pour afficher les données."
        action={
          <Link
            href={ROUTES.DASHBOARD}
            className="text-primary text-sm font-medium hover:underline"
          >
            Configurer le portfolio
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
