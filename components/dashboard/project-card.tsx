"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { ProjectCoverArt } from "@/components/dashboard/project-cover-art";
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
import type { UnilizeKeyword, UnilizeProject } from "@/types/unilize";
import { toKeywordValues } from "@/lib/projects/keywords";
import { formatPercentValue } from "@/lib/utils/formatting";

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
  onEdit,
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  isBusy: boolean;
  onEdit: (project: UnilizeProject) => void;
  onEditKeywords: (project: UnilizeProject) => void;
  onDelete: (project: UnilizeProject) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shrink-0 rounded-lg"
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
        <DropdownMenuItem disabled={isBusy} onClick={() => onEdit(project)}>
          <HugeiconsIcon
            icon={Edit02Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          Modifier le projet
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

function KeywordsSection({
  keywords,
  isLoading,
  errorMessage,
  isBusy,
  onEditKeywords,
  project,
}: {
  keywords: UnilizeKeyword[];
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

  const values = toKeywordValues(keywords);
  const { visible, overflowCount } = truncateList(values, MAX_VISIBLE_KEYWORDS);
  const hiddenKeywords = values.slice(MAX_VISIBLE_KEYWORDS).join(", ");

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
        Mots-clés
      </p>
      <ul className="line-clamp-2 flex flex-wrap items-center gap-1">
        {visible.map((keywordLabel, index) => (
          <li key={`${keywordLabel}-${index}`}>
            <Badge variant="outline" className="max-w-[8rem] truncate text-xs font-normal">
              {keywordLabel}
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
  isBusy,
  onEdit,
  onEditKeywords,
  onDelete,
}: {
  project: UnilizeProject;
  queryIndex: number;
  projectDetailsQueries: ReturnType<typeof useProjectsDetails>;
  isBusy: boolean;
  onEdit: (project: UnilizeProject) => void;
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

  return (
    <article className="bg-card relative flex h-full flex-col overflow-hidden rounded-xl border border-border transition-transform duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px]">
      <ProjectCoverArt projectId={project.id} />

      <div className="flex min-h-[9rem] flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-lg font-semibold leading-snug">
            {project.name}
          </h3>
          <ProjectActionsMenu
            project={project}
            isBusy={isBusy}
            onEdit={onEdit}
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

        <p className="text-muted-foreground mt-auto text-xs">
          <span className="font-medium uppercase tracking-wide text-[10px]">
            CTR benchmark SEA
          </span>{" "}
          <span className="text-foreground tabular-nums">
            {typeof project.ctr_benchmark === "number"
              ? formatPercentValue(project.ctr_benchmark)
              : "—"}
          </span>
        </p>
      </div>
    </article>
  );
}
