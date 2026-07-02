"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { ProjectCoverArt } from "@/components/dashboard/project-cover-art";
import { ProjectReadinessBadge } from "@/components/dashboard/project-readiness-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateList } from "@/lib/dashboard/truncate-list";
import {
  isEmptyResourceApiError,
  toUserFacingApiError,
} from "@/lib/api/error-messages";
import type { useProjectsCampaigns, useProjectsDetails } from "@/hooks/use-unilize-api";
import { isQueryInitialLoading } from "@/lib/unilize/query-display";
import { hasCustomerId } from "@/lib/projects/project-readiness";
import type { ProjectReadiness } from "@/lib/projects/project-readiness";
import { cn } from "@/lib/utils/cn";
import type { UnilizeCampaign, UnilizeProject } from "@/types/unilize";

const MAX_VISIBLE_CAMPAIGNS = 2;
const MAX_VISIBLE_KEYWORDS = 4;

function InlineIconAction({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: typeof Add01Icon;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground h-6 w-6 shrink-0"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <HugeiconsIcon
        icon={icon}
        size={14}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
}

function ProjectActionsMenu({
  project,
  isBusy,
  onAddCampaign,
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  isBusy: boolean;
  onAddCampaign: (project: UnilizeProject) => void;
  onEditKeywords: (project: UnilizeProject) => void;
  onDelete: (project: UnilizeProject) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isBusy}
          title="Actions du projet"
          aria-label={`Actions pour ${project.name}`}
        >
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          disabled={isBusy}
          onClick={() => onAddCampaign(project)}
        >
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          Ajouter une campagne
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isBusy}
          onClick={() => onEditKeywords(project)}
        >
          <HugeiconsIcon
            icon={Edit02Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          Modifier les mots clés
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isBusy}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => onDelete(project)}
        >
          <HugeiconsIcon
            icon={Delete02Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          Supprimer le projet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CampaignsSection({
  project,
  campaigns,
  isLoading,
  errorMessage,
  isBusy,
  onUnlink,
  onAddCampaign,
}: {
  project: UnilizeProject;
  campaigns: UnilizeCampaign[];
  isLoading: boolean;
  errorMessage: string | null;
  isBusy: boolean;
  onUnlink: (project: UnilizeProject, campaign: UnilizeCampaign) => void;
  onAddCampaign: (project: UnilizeProject) => void;
}) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-xs">Campagnes — chargement…</p>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <p
          className="text-muted-foreground text-xs"
          title={toUserFacingApiError(errorMessage, {
            fallback: "Campagnes indisponibles",
          })}
        >
          Campagnes indisponibles
        </p>
        <InlineIconAction
          label="Ajouter une campagne"
          icon={Add01Icon}
          disabled={isBusy}
          onClick={() => onAddCampaign(project)}
        />
      </div>
    );
  }

  if (campaigns.length === 0) {
    const awaitingCampaign = hasCustomerId(project);
    return (
      <div className="flex flex-wrap items-center gap-1">
        <p
          className={cn(
            "text-xs font-medium",
            awaitingCampaign ? "text-muted-foreground" : "text-warning",
          )}
        >
          {awaitingCampaign
            ? "Campagne en cours d’activation…"
            : "Aucune campagne disponible"}
        </p>
        {!awaitingCampaign ? (
          <InlineIconAction
            label="Ajouter une campagne"
            icon={Add01Icon}
            disabled={isBusy}
            onClick={() => onAddCampaign(project)}
          />
        ) : null}
      </div>
    );
  }

  const { visible, overflowCount } = truncateList(
    campaigns,
    MAX_VISIBLE_CAMPAIGNS,
  );
  const hiddenNames = campaigns
    .slice(MAX_VISIBLE_CAMPAIGNS)
    .map((c) => c.name)
    .join(", ");

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
        Campagnes
      </p>
      <ul className="flex flex-wrap items-center gap-1">
        {visible.map((campaign) => (
          <li key={campaign.id} className="max-w-full">
            <Badge
              variant="secondary"
              className="max-w-[9rem] gap-1 py-0.5 pl-2 pr-1 text-xs font-normal"
            >
              <span className="truncate">{campaign.name}</span>
              <button
                type="button"
                title={`Délier la campagne ${campaign.name}`}
                aria-label={`Délier la campagne ${campaign.name}`}
                disabled={isBusy}
                onClick={() => onUnlink(project, campaign)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer focus-visible:ring-ring shrink-0 rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </button>
            </Badge>
          </li>
        ))}
        {overflowCount > 0 ? (
          <li>
            <Badge
              variant="outline"
              className="text-xs font-normal"
              title={hiddenNames}
            >
              +{overflowCount}
            </Badge>
          </li>
        ) : null}
        <li>
          <InlineIconAction
            label="Ajouter une campagne"
            icon={Add01Icon}
            disabled={isBusy}
            onClick={() => onAddCampaign(project)}
          />
        </li>
      </ul>
    </div>
  );
}

function KeywordsSection({
  keywords,
  isLoading,
  errorMessage,
  isBusy,
  onEditKeywords,
  project,
}: {
  keywords: string[];
  isLoading: boolean;
  errorMessage: string | null;
  isBusy: boolean;
  onEditKeywords: (project: UnilizeProject) => void;
  project: UnilizeProject;
}) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-xs">Mots-clés — chargement…</p>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <p
          className="text-muted-foreground text-xs"
          title={toUserFacingApiError(errorMessage, {
            fallback: "Mots-clés indisponibles",
          })}
        >
          Mots-clés indisponibles
        </p>
        <InlineIconAction
          label="Modifier les mots-clés"
          icon={Edit02Icon}
          disabled={isBusy}
          onClick={() => onEditKeywords(project)}
        />
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <p className="text-warning text-xs font-medium">Aucun mot-clé</p>
        <InlineIconAction
          label="Modifier les mots-clés"
          icon={Edit02Icon}
          disabled={isBusy}
          onClick={() => onEditKeywords(project)}
        />
      </div>
    );
  }

  const { visible, overflowCount } = truncateList(keywords, MAX_VISIBLE_KEYWORDS);
  const hiddenKeywords = keywords.slice(MAX_VISIBLE_KEYWORDS).join(", ");

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
        Mots-clés
      </p>
      <ul className="line-clamp-2 flex flex-wrap items-center gap-1">
        {visible.map((keyword) => (
          <li key={keyword}>
            <Badge variant="outline" className="max-w-[8rem] truncate text-xs font-normal">
              {keyword}
            </Badge>
          </li>
        ))}
        {overflowCount > 0 ? (
          <li>
            <Badge
              variant="outline"
              className="text-xs font-normal"
              title={hiddenKeywords}
            >
              +{overflowCount}
            </Badge>
          </li>
        ) : null}
        <li>
          <InlineIconAction
            label="Modifier les mots-clés"
            icon={Edit02Icon}
            disabled={isBusy}
            onClick={() => onEditKeywords(project)}
          />
        </li>
      </ul>
    </div>
  );
}

export function ProjectCard({
  project,
  queryIndex,
  campaignQueries,
  projectDetailsQueries,
  readiness,
  isBusy,
  onUnlink,
  onAddCampaign,
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  queryIndex: number;
  campaignQueries: ReturnType<typeof useProjectsCampaigns>;
  projectDetailsQueries: ReturnType<typeof useProjectsDetails>;
  readiness: ProjectReadiness;
  isBusy: boolean;
  onUnlink: (project: UnilizeProject, campaign: UnilizeCampaign) => void;
  onAddCampaign: (project: UnilizeProject) => void;
  onEditKeywords: (project: UnilizeProject) => void;
  onDelete: (project: UnilizeProject) => void;
}) {
  const campaignQuery = campaignQueries[queryIndex];
  const detailsQuery = projectDetailsQueries[queryIndex];

  const campaignsLoading = isQueryInitialLoading(campaignQuery);
  const keywordsLoading = isQueryInitialLoading(detailsQuery);

  let campaignsError: string | null = null;
  if (campaignQuery?.isError) {
    const msg = campaignQuery.error?.message ?? "";
    campaignsError = isEmptyResourceApiError(msg) ? null : msg;
  }

  let keywordsError: string | null = null;
  if (detailsQuery?.isError) {
    const msg = detailsQuery.error?.message ?? "";
    keywordsError = isEmptyResourceApiError(msg) ? null : msg;
  }

  const campaigns = campaignQuery?.data?.campaigns ?? [];
  const keywords =
    detailsQuery?.data?.project?.keywords ?? project.keywords ?? [];
  const showSetupBorder = readiness === "setup_required";

  return (
    <article
      className={cn(
        "bg-card relative flex h-full flex-col overflow-hidden rounded-xl border shadow-sm hover:translate-y-[-1px] hover:translate-x-[-1px] transition-transform duration-100",
        showSetupBorder && "border-warning/40",
      )}
    >
      <div className="absolute top-2 right-2 z-10">
        <ProjectReadinessBadge readiness={readiness} />
      </div>

      <ProjectCoverArt projectId={project.id} />

      <div className="flex min-h-[9rem] flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-lg font-semibold leading-snug">
            {project.name}
          </h3>
          <ProjectActionsMenu
            project={project}
            isBusy={isBusy}
            onAddCampaign={onAddCampaign}
            onEditKeywords={onEditKeywords}
            onDelete={onDelete}
          />
        </div>

        <CampaignsSection
          project={project}
          campaigns={campaigns}
          isLoading={campaignsLoading}
          errorMessage={campaignsError}
          isBusy={isBusy}
          onUnlink={onUnlink}
          onAddCampaign={onAddCampaign}
        />

        <KeywordsSection
          project={project}
          keywords={keywords}
          isLoading={keywordsLoading}
          errorMessage={keywordsError}
          isBusy={isBusy}
          onEditKeywords={onEditKeywords}
        />
      </div>
    </article>
  );
}
