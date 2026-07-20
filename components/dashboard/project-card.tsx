"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import type { useProjectsDetails } from "@/hooks/use-unilize-api";
import { isQueryInitialLoading } from "@/lib/unilize/query-display";
import type { ProjectReadiness } from "@/lib/projects/project-readiness";
import { cn } from "@/lib/utils/cn";
import type { UnilizeProject } from "@/types/unilize";

const MAX_VISIBLE_KEYWORDS = 4;

function InlineIconAction({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: typeof Edit02Icon;
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
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  isBusy: boolean;
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
  projectDetailsQueries,
  readiness,
  isBusy,
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  queryIndex: number;
  projectDetailsQueries: ReturnType<typeof useProjectsDetails>;
  readiness: ProjectReadiness;
  isBusy: boolean;
  onEditKeywords: (project: UnilizeProject) => void;
  onDelete: (project: UnilizeProject) => void;
}) {
  const detailsQuery = projectDetailsQueries[queryIndex];

  const keywordsLoading = isQueryInitialLoading(detailsQuery);

  let keywordsError: string | null = null;
  if (detailsQuery?.isError) {
    const msg = detailsQuery.error?.message ?? "";
    keywordsError = isEmptyResourceApiError(msg) ? null : msg;
  }

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
            onEditKeywords={onEditKeywords}
            onDelete={onDelete}
          />
        </div>

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
