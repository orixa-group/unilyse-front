"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
} from "@hugeicons/core-free-icons";
import {
  deleteProjectAction,
  updateProjectKeywordsAction,
} from "@/app/(auth)/actions/unilize-actions";
import {
  initialDeleteProjectState,
  initialUpdateProjectKeywordsState,
} from "@/app/(auth)/actions/unilize-action-state";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { DashboardHealthSummary } from "@/components/dashboard/dashboard-health-summary";
import { ProjectCard } from "@/components/dashboard/project-card";
import {
  ProjectSetupBanner,
} from "@/components/dashboard/project-setup-banner";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  shouldBlockDashboardView,
  toUserFacingApiError,
} from "@/lib/api/error-messages";
import { useClient, useProjects, useProjectsDetails } from "@/hooks/use-unilize-api";
import { useProjectsSyncProbe } from "@/hooks/use-project-sync-probe";
import { useSelectionHydrated } from "@/hooks/use-selection-hydrated";
import { unilizeKeys } from "@/lib/api/unilize";
import {
  computeProjectReadiness,
  isProjectSetupComplete,
} from "@/lib/projects/project-readiness";
import {
  logUnilizeFetchSnapshot,
  summarizeKeywords,
} from "@/lib/unilize/request-log";
import { normalizeProjectsFromQuery } from "@/lib/unilize/normalize";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizeProject } from "@/types/unilize";

export function DashboardView() {
  const queryClient = useQueryClient();
  const hasHydrated = useSelectionHydrated();
  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const setSelectedProjectId = useSelectionStore((s) => s.setSelectedProjectId);

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [recentlyCreatedProjectId, setRecentlyCreatedProjectId] = useState<
    string | null
  >(null);
  const [dismissedSetupBannerIds, setDismissedSetupBannerIds] = useState<
    Set<string>
  >(() => new Set());
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<UnilizeProject | null>(
    null,
  );
  const [projectForKeywords, setProjectForKeywords] =
    useState<UnilizeProject | null>(null);

  const processedCreateIdRef = useRef<string | null>(null);
  const processedDeleteIdRef = useRef<string | null>(null);
  const processedKeywordsIdRef = useRef<string | null>(null);

  const {
    data: clientResult,
    isLoading: isClientLoading,
    isFetching: isClientFetching,
  } = useClient(hasHydrated ? selectedClientId : null);
  const {
    data: projectsResult,
    isLoading: isProjectsLoading,
    isPending: isProjectsPending,
    isFetching: isProjectsFetching,
    isError: isProjectsError,
    error: projectsQueryError,
  } = useProjects(hasHydrated ? selectedClientId : null);

  const projects = normalizeProjectsFromQuery(projectsResult);
  const projectsListReady =
    Boolean(selectedClientId) && !isProjectsPending && !isProjectsError;
  const projectIds = useMemo(
    () => (projectsListReady ? projects.map((project) => project.id) : []),
    [projectsListReady, projects],
  );
  const projectDetailsQueries = useProjectsDetails(projectIds, {
    enabled: projectsListReady,
  });

  const projectsEnriched = useMemo(() => {
    return projects.map((project, index) => {
      const fetchedKeywords =
        projectDetailsQueries[index]?.data?.project?.keywords;
      if (!fetchedKeywords) {
        return project;
      }
      return { ...project, keywords: fetchedKeywords };
    });
  }, [projects, projectDetailsQueries]);

  const normalizedProjectSearch = projectSearchQuery.trim().toLowerCase();
  const filteredProjects = useMemo(() => {
    if (!normalizedProjectSearch) {
      return projectsEnriched;
    }

    return projectsEnriched.filter((project) => {
      if (project.name.toLowerCase().includes(normalizedProjectSearch)) {
        return true;
      }

      return (
        project.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(normalizedProjectSearch),
        ) ?? false
      );
    });
  }, [projectsEnriched, normalizedProjectSearch]);
  const projectQueryIndexById = useMemo(
    () => new Map(projects.map((project, index) => [project.id, index])),
    [projects],
  );

  const syncProbeTargets = useMemo(() => {
    return projects.map((project, index) => {
      const keywords =
        projectDetailsQueries[index]?.data?.project?.keywords ??
        project.keywords ??
        [];
      const keywordsFetched = projectDetailsQueries[index]?.isFetched ?? false;

      return {
        project,
        setupComplete: isProjectSetupComplete({
          project,
          keywords,
          keywordsFetched,
        }),
      };
    });
  }, [projects, projectDetailsQueries]);

  const syncProbeResults = useProjectsSyncProbe(syncProbeTargets);

  const readinessByProjectId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeProjectReadiness>>();

    projects.forEach((project, index) => {
      const keywords =
        projectDetailsQueries[index]?.data?.project?.keywords ??
        project.keywords ??
        [];
      const probe = syncProbeResults.get(project.id);

      map.set(
        project.id,
        computeProjectReadiness({
          project,
          keywords,
          keywordsFetched: projectDetailsQueries[index]?.isFetched ?? false,
          hasPerformances: probe?.hasPerformances ?? false,
          syncProbeTimedOut: probe?.timedOut ?? false,
        }),
      );
    });

    return map;
  }, [projects, projectDetailsQueries, syncProbeResults]);

  const setupBannerProject = useMemo(() => {
    if (!recentlyCreatedProjectId) {
      return null;
    }
    if (dismissedSetupBannerIds.has(recentlyCreatedProjectId)) {
      return null;
    }

    const project = projectsEnriched.find(
      (item) => item.id === recentlyCreatedProjectId,
    );
    if (!project) {
      return null;
    }

    const readiness = readinessByProjectId.get(project.id);
    if (readiness === "ready") {
      return null;
    }

    return project;
  }, [
    recentlyCreatedProjectId,
    dismissedSetupBannerIds,
    projectsEnriched,
    readinessByProjectId,
  ]);

  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteProjectAction,
    initialDeleteProjectState,
  );
  const [keywordsState, keywordsFormAction, isKeywordsPending] = useActionState(
    updateProjectKeywordsAction,
    initialUpdateProjectKeywordsState,
  );

  const isBusy = isDeletePending || isKeywordsPending;

  const client = clientResult?.client ?? null;
  const projectCount = projects.length;

  const clientErrorRaw = clientResult?.error ?? null;
  const projectsErrorRaw =
    projectsResult && "error" in projectsResult && projectsResult.error
      ? projectsResult.error
      : isProjectsError
        ? (projectsQueryError?.message ?? "Impossible de charger les projets.")
        : null;

  const clientError = shouldBlockDashboardView({
    errorMessage: clientErrorRaw,
    isFetching: isClientFetching,
    usableItemCount: client ? 1 : 0,
  })
    ? toUserFacingApiError(clientErrorRaw, {
        fallback: "Impossible de charger le client.",
      })
    : null;
  const projectsError = shouldBlockDashboardView({
    errorMessage: projectsErrorRaw,
    isFetching: isProjectsFetching,
    usableItemCount: projects.length,
  })
    ? toUserFacingApiError(projectsErrorRaw, {
        fallback: "Impossible de charger les projets.",
      })
    : null;
  const isLoading =
    !hasHydrated ||
    isClientLoading ||
    isProjectsPending ||
    (isProjectsFetching && projects.length === 0 && !isProjectsError);

  const countLabel = useMemo(() => {
    if (projectCount === 0) {
      return "Aucun projet";
    }

    const totalLabel =
      projectCount === 1 ? "1 projet" : `${projectCount} projets`;

    if (!normalizedProjectSearch) {
      return totalLabel;
    }

    const filteredCount = filteredProjects.length;
    if (filteredCount === 0) {
      return `Aucun résultat sur ${totalLabel}`;
    }
    if (filteredCount === 1) {
      return `1 projet sur ${totalLabel}`;
    }
    return `${filteredCount} projets sur ${totalLabel}`;
  }, [filteredProjects.length, normalizedProjectSearch, projectCount]);

  const healthStats = useMemo(() => {
    let keywordCount = 0;

    projects.forEach((project, index) => {
      const keywords =
        projectDetailsQueries[index]?.data?.project?.keywords ??
        project.keywords ??
        [];
      keywordCount += keywords.length;
    });

    return {
      projectCount,
      keywordCount,
    };
  }, [projects, projectDetailsQueries, projectCount]);

  useEffect(() => {
    if (!hasHydrated || !selectedClientId) {
      return;
    }

    logUnilizeFetchSnapshot({
      clientId: selectedClientId,
      client: client ? { id: client.id, name: client.name } : null,
      clientError: clientErrorRaw,
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      projectsError: projectsErrorRaw,
      perProject: projects.map((project, index) => ({
        projectId: project.id,
        projectName: project.name,
        queryIndex: index,
        keywords: {
          isFetched: projectDetailsQueries[index]?.isFetched ?? false,
          isFetching: projectDetailsQueries[index]?.isFetching ?? false,
          isError: projectDetailsQueries[index]?.isError ?? false,
          errorMessage: projectDetailsQueries[index]?.error?.message ?? null,
          data: summarizeKeywords(
            projectDetailsQueries[index]?.data?.project?.keywords,
          ),
        },
      })),
    });
  }, [
    hasHydrated,
    selectedClientId,
    client,
    clientErrorRaw,
    projects,
    projectsErrorRaw,
    projectDetailsQueries,
  ]);

  const invalidateProjectDetails = (projectId: string) => {
    void queryClient.invalidateQueries({
      queryKey: unilizeKeys.projectDetails(projectId),
    });
    void queryClient.refetchQueries({
      queryKey: unilizeKeys.projectDetails(projectId),
    });
  };


  const handleProjectCreated = useCallback(
    (result: { success: boolean; project?: UnilizeProject; clientId?: string }) => {
      if (!result.success || !result.project || !result.clientId) {
        return;
      }
      if (processedCreateIdRef.current === result.project.id) {
        return;
      }
      processedCreateIdRef.current = result.project.id;

      void queryClient.invalidateQueries({
        queryKey: unilizeKeys.projects(result.clientId),
      });
      void queryClient.refetchQueries({
        queryKey: unilizeKeys.projects(result.clientId),
      });
      setRecentlyCreatedProjectId(result.project.id);
      setSelectedProjectId(result.project.id);
      setCreateProjectOpen(false);
    },
    [queryClient, setSelectedProjectId],
  );


  useEffect(() => {
    if (
      !deleteState.success ||
      !deleteState.deletedProjectId ||
      !deleteState.clientId
    ) {
      return;
    }
    if (processedDeleteIdRef.current === deleteState.deletedProjectId) {
      return;
    }
    processedDeleteIdRef.current = deleteState.deletedProjectId;

    void queryClient.invalidateQueries({
      queryKey: unilizeKeys.projects(deleteState.clientId),
    });
    void queryClient.refetchQueries({
      queryKey: unilizeKeys.projects(deleteState.clientId),
    });
    setDeleteProjectOpen(false);
    setProjectToDelete(null);
  }, [deleteState, queryClient]);


  useEffect(() => {
    if (!keywordsState.success || !keywordsState.projectId) {
      return;
    }
    const key = `${keywordsState.projectId}:${keywordsState.keywords?.join(",") ?? ""}`;
    if (processedKeywordsIdRef.current === key) {
      return;
    }
    processedKeywordsIdRef.current = key;

    invalidateProjectDetails(keywordsState.projectId);
    setKeywordsOpen(false);
    setProjectForKeywords(null);
  }, [keywordsState, queryClient]);

  if (!selectedClientId) {
    return (
      <EmptyState
        title="Aucun client sélectionné"
        description="Sélectionnez un client dans le menu en haut de page pour afficher ses projets."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Chargement">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingSkeleton className="h-20 w-full" />
          <LoadingSkeleton className="h-20 w-full" />
          <LoadingSkeleton className="h-20 w-full" />
        </div>
        <LoadingSkeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (clientError || projectsError) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {clientError ?? projectsError}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHealthSummary {...healthStats} />

      {setupBannerProject ? (
        <ProjectSetupBanner
          project={setupBannerProject}
          keywords={
            projectDetailsQueries[
              projectQueryIndexById.get(setupBannerProject.id) ?? 0
            ]?.data?.project?.keywords ??
            setupBannerProject.keywords ??
            []
          }
          keywordsFetched={
            projectDetailsQueries[
              projectQueryIndexById.get(setupBannerProject.id) ?? 0
            ]?.isFetched ?? false
          }
          readiness={
            readinessByProjectId.get(setupBannerProject.id) ?? "setup_required"
          }
          onDismiss={() => {
            setDismissedSetupBannerIds((previous) => {
              const next = new Set(previous);
              next.add(setupBannerProject.id);
              return next;
            });
          }}
          onEditKeywords={() => {
            setProjectForKeywords(setupBannerProject);
            setKeywordsOpen(true);
          }}
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {client?.name ? (
            <>
              <span className="text-foreground font-medium">{client.name}</span>
              {" — "}
            </>
          ) : null}
          {countLabel}
          {isProjectsFetching && !isProjectsLoading ? " — actualisation…" : ""}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="default"
            onClick={() => setCreateProjectOpen(true)}
            disabled={isBusy}
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
            Créer un projet
          </Button>
          <Input
            type="search"
            value={projectSearchQuery}
            onChange={(event) => setProjectSearchQuery(event.target.value)}
            placeholder="Rechercher un projet…"
            aria-label="Rechercher un projet"
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {projectCount === 0 ? (
        <EmptyState
          title="Aucun projet"
          description="Ce client n'a pas encore de projet. Créez-en un pour commencer."
          action={
            <Button type="button" onClick={() => setCreateProjectOpen(true)}>
              Créer un projet
            </Button>
          }
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="Aucun projet trouvé"
          description={
            normalizedProjectSearch
              ? `Aucun projet ne correspond à « ${projectSearchQuery.trim()} ».`
              : "Aucun projet à afficher."
          }
        />
      ) : (
        <div className="space-y-3">
          {/* <h2 className="text-sm font-semibold tracking-tight">Projets</h 2> */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const queryIndex = projectQueryIndexById.get(project.id) ?? 0;
              const readiness =
                readinessByProjectId.get(project.id) ?? "setup_required";

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  queryIndex={queryIndex}
                  projectDetailsQueries={projectDetailsQueries}
                  readiness={readiness}
                  isBusy={isBusy}
                  onEditKeywords={(p) => {
                    setProjectForKeywords(p);
                    setKeywordsOpen(true);
                  }}
                  onDelete={(p) => {
                    setProjectToDelete(p);
                    setDeleteProjectOpen(true);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        clientId={selectedClientId ?? ""}
        clientName={client?.name ?? "sélectionné"}
        onCreated={handleProjectCreated}
      />

      <Dialog
        open={deleteProjectOpen}
        onOpenChange={(open) => {
          setDeleteProjectOpen(open);
          if (!open) {
            setProjectToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              {projectToDelete ? (
                <>
                  Cette action est irréversible. Le projet{" "}
                  <span className="text-foreground font-medium">
                    {projectToDelete.name}
                  </span>{" "}
                  sera supprimé.
                </>
              ) : (
                "Aucun projet sélectionné."
              )}
            </DialogDescription>
          </DialogHeader>
          {projectToDelete ? (
            <form action={deleteFormAction} className="space-y-4">
              <input type="hidden" name="clientId" value={selectedClientId} />
              <input
                type="hidden"
                name="projectId"
                value={projectToDelete.id}
              />
              {deleteState.error ? (
                <p className="text-destructive text-sm" role="alert">
                  {deleteState.error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteProjectOpen(false)}
                  disabled={isDeletePending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="destructiveOutline"
                  disabled={isDeletePending}
                >
                  {isDeletePending ? "Suppression…" : "Supprimer"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={keywordsOpen}
        onOpenChange={(open) => {
          setKeywordsOpen(open);
          if (!open) {
            setProjectForKeywords(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour les mots clés</DialogTitle>
            <DialogDescription>
              {projectForKeywords ? (
                <>
                  Remplace la liste complète des mots-clés du projet{" "}
                  <span className="text-foreground font-medium">
                    {projectForKeywords.name}
                  </span>
                  . Un mot-clé par ligne, sans doublons.
                </>
              ) : (
                "Aucun projet sélectionné."
              )}
            </DialogDescription>
          </DialogHeader>
          {projectForKeywords ? (
            <form action={keywordsFormAction} className="space-y-4">
              <input
                type="hidden"
                name="projectId"
                value={projectForKeywords.id}
              />
              <div className="space-y-2">
                <Label htmlFor="project-keywords">Mots clés</Label>
                <Textarea
                  id="project-keywords"
                  name="keywordsRaw"
                  key={projectForKeywords.id}
                  defaultValue={
                    projectDetailsQueries[
                      projectQueryIndexById.get(projectForKeywords.id) ?? 0
                    ]?.data?.project?.keywords?.join("\n") ??
                    projectForKeywords.keywords?.join("\n") ??
                    ""
                  }
                  placeholder={"seo\nsea\nppc"}
                  required
                  disabled={isKeywordsPending}
                  autoFocus
                />
              </div>
              {keywordsState.error ? (
                <p className="text-destructive text-sm" role="alert">
                  {keywordsState.error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setKeywordsOpen(false)}
                  disabled={isKeywordsPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isKeywordsPending}>
                  {isKeywordsPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
