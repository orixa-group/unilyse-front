"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  computeProjectReadiness,
  getProjectReadinessMeta,
  getSetupMissingReasons,
  getSetupReasonLabel,
  type ProjectReadiness,
} from "@/lib/projects/project-readiness";
import { cn } from "@/lib/utils/cn";
import type { UnilizeCampaign, UnilizeProject } from "@/types/unilize";

function ChecklistItem({
  done,
  inProgress,
  label,
}: {
  done: boolean;
  inProgress?: boolean;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={16}
          className="text-emerald-600 dark:text-emerald-400 shrink-0"
          color="currentColor"
          strokeWidth={1.5}
        />
      ) : inProgress ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="text-primary shrink-0 animate-spin"
          color="currentColor"
          strokeWidth={1.5}
        />
      ) : (
        <span
          className="border-muted-foreground/40 size-4 shrink-0 rounded-full border"
          aria-hidden
        />
      )}
      <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </li>
  );
}

export function ProjectSetupBanner({
  project,
  keywords,
  keywordsFetched,
  campaigns,
  campaignsFetched,
  readiness,
  onDismiss,
  onEditKeywords,
}: {
  project: UnilizeProject;
  keywords: string[];
  keywordsFetched: boolean;
  campaigns: UnilizeCampaign[];
  campaignsFetched: boolean;
  readiness: ProjectReadiness;
  onDismiss: () => void;
  onEditKeywords: () => void;
}) {
  const meta = getProjectReadinessMeta(readiness);
  const missing = getSetupMissingReasons({ project, keywords, campaigns });
  const gscDone = true;
  const customerDone = !missing.includes("customer_id");
  const keywordsDone = !missing.includes("keywords");
  const campaignDone = !missing.includes("campaign");
  const syncInProgress = readiness === "awaiting_first_sync";
  const syncDone = readiness === "ready";

  return (
    <Surface variant="muted" padding="md" className="relative space-y-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={onDismiss}
        aria-label="Fermer la checklist de configuration"
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          size={14}
          color="currentColor"
          strokeWidth={1.5}
        />
      </Button>

      <div className="pr-8">
        <p className="text-sm font-semibold">
          Configuration de{" "}
          <span className="text-foreground">{project.name}</span>
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{meta.description}</p>
      </div>

      <ul className="space-y-2">
        <ChecklistItem done={gscDone} label="Site Google Search Console" />
        <ChecklistItem
          done={customerDone}
          label={getSetupReasonLabel("customer_id")}
        />
        <ChecklistItem
          done={keywordsDone}
          label={getSetupReasonLabel("keywords")}
        />
        {!keywordsFetched || !campaignsFetched ? (
          <ChecklistItem
            done={false}
            inProgress
            label="Chargement de la configuration…"
          />
        ) : (
          <ChecklistItem done={campaignDone} label={getSetupReasonLabel("campaign")} />
        )}
        <ChecklistItem
          done={syncDone}
          inProgress={syncInProgress}
          label="Première synchronisation des données"
        />
      </ul>

      {readiness === "setup_required" && missing.includes("keywords") ? (
        <Button type="button" size="sm" variant="outline" onClick={onEditKeywords}>
          Ajouter des mots-clés
        </Button>
      ) : null}
    </Surface>
  );
}

export function buildProjectReadinessForBanner(input: {
  project: UnilizeProject;
  keywords: string[];
  keywordsFetched: boolean;
  campaigns: UnilizeCampaign[];
  campaignsFetched: boolean;
  hasPerformances: boolean;
  syncProbeTimedOut: boolean;
}): ProjectReadiness {
  return computeProjectReadiness({
    project: input.project,
    keywords: input.keywords,
    keywordsFetched: input.keywordsFetched,
    campaigns: input.campaigns,
    campaignsFetched: input.campaignsFetched,
    hasPerformances: input.hasPerformances,
    syncProbeTimedOut: input.syncProbeTimedOut,
  });
}
