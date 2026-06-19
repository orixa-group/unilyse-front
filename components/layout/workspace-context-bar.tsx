"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import {
  createClientAction,
  deleteClientAction,
} from "@/app/(auth)/actions/unilize-actions";
import {
  initialCreateClientState,
  initialDeleteClientState,
} from "@/app/(auth)/actions/unilize-action-state";
import { Autocomplete } from "@/components/ui/autocomplete";
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
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useClients } from "@/hooks/use-unilize-api";
import { useProjectCampaignContext } from "@/hooks/use-project-campaign-context";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { unilizeKeys } from "@/lib/api/unilize";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizeClient } from "@/types/unilize";

function resolveSelectedClientId(
  clients: UnilizeClient[],
  currentId: string | null,
): string | null {
  if (!currentId) {
    return null;
  }
  return clients.some((c) => c.id === currentId) ? currentId : null;
}

export function WorkspaceContextBar() {
  const queryClient = useQueryClient();
  const {
    data: clients = [],
    error: clientsError,
    isPending: isClientsPending,
  } = useClients();
  const loadError = clientsError
    ? toUserFacingApiError(clientsError.message, {
        fallback: "Impossible de charger les clients.",
      })
    : null;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const setSelectedClientId = useSelectionStore((s) => s.setSelectedClientId);

  const {
    hasHydrated,
    selectedProjectId,
    selectedCampaignId,
    setSelectedProjectId,
    setSelectedCampaignId,
    projectOptions,
    campaignOptions,
    isSelectorsLoading,
    isContextFetching,
  } = useProjectCampaignContext();

  const [createState, createFormAction, isCreatePending] = useActionState(
    createClientAction,
    initialCreateClientState,
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteClientAction,
    initialDeleteClientState,
  );

  const isBusy = isCreatePending || isDeletePending;
  const processedCreateIdRef = useRef<string | null>(null);
  const processedDeleteIdRef = useRef<string | null>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  useEffect(() => {
    if (loadError) {
      return;
    }
    const nextId = resolveSelectedClientId(clients, selectedClientId);
    if (nextId !== selectedClientId) {
      setSelectedClientId(nextId);
    }
  }, [clients, selectedClientId, setSelectedClientId, loadError]);

  useEffect(() => {
    if (!createState.success || !createState.client) {
      return;
    }
    const created = createState.client;
    if (processedCreateIdRef.current === created.id) {
      return;
    }
    processedCreateIdRef.current = created.id;
    setSelectedClientId(created.id);
    setCreateDialogOpen(false);
    void queryClient.invalidateQueries({ queryKey: unilizeKeys.clients() });
  }, [createState, queryClient, setSelectedClientId]);

  useEffect(() => {
    if (!deleteState.success || !deleteState.deletedClientId) {
      return;
    }
    const deletedId = deleteState.deletedClientId;
    if (processedDeleteIdRef.current === deletedId) {
      return;
    }
    processedDeleteIdRef.current = deletedId;
    const remaining = clients.filter((c) => c.id !== deletedId);
    const nextSelectedId =
      selectedClientId === deletedId
        ? null
        : resolveSelectedClientId(remaining, selectedClientId);
    setSelectedClientId(nextSelectedId);
    setDeleteDialogOpen(false);
    void queryClient.invalidateQueries({ queryKey: unilizeKeys.all });
  }, [deleteState, clients, selectedClientId, queryClient, setSelectedClientId]);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id, label: c.name })),
    [clients],
  );

  if (!hasHydrated || (isClientsPending && clients.length === 0)) {
    return (
      <header className="bg-background/80 shrink-0 border-b backdrop-blur">
        <div className="px-4 py-3 md:px-6">
          <LoadingSkeleton className="h-9 w-full max-w-4xl" />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 shrink-0 border-b backdrop-blur">
      <div className="space-y-3 px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-w-0 items-center gap-1">
              <Autocomplete
                id="workspace-client"
                className="min-w-0 flex-1"
                options={clientOptions}
                value={selectedClientId}
                onValueChange={setSelectedClientId}
                clearable
                clearLabel="Aucun client"
                placeholder="Client"
                searchPlaceholder="Rechercher un client…"
                emptyMessage="Aucun client"
                noResultsMessage="Aucun client trouvé"
                disabled={clients.length === 0 || isBusy}
                aria-label="Sélectionner un client"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCreateDialogOpen(true)}
                disabled={isBusy}
                aria-label="Créer un client"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="destructiveOutline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!selectedClientId || isBusy}
                aria-label="Supprimer le client"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </Button>
            </div>

            <Autocomplete
              id="workspace-project"
              options={projectOptions}
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              clearable
              clearLabel="Aucun projet"
              placeholder="Projet"
              searchPlaceholder="Rechercher un projet…"
              emptyMessage={
                selectedClientId ? "Aucun projet" : "Sélectionnez un client"
              }
              noResultsMessage="Aucun projet trouvé"
              disabled={
                !selectedClientId ||
                isSelectorsLoading ||
                projectOptions.length === 0
              }
              aria-label="Sélectionner un projet"
            />

            <Autocomplete
              id="workspace-campaign"
              options={campaignOptions}
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
              clearable
              clearLabel="Aucune campagne"
              placeholder="Campagne"
              searchPlaceholder="Rechercher une campagne…"
              emptyMessage={
                selectedProjectId
                  ? "Aucune campagne"
                  : "Sélectionnez un projet"
              }
              noResultsMessage="Aucune campagne trouvée"
              disabled={
                !selectedProjectId ||
                isSelectorsLoading ||
                campaignOptions.length === 0
              }
              aria-label="Sélectionner une campagne"
            />
          </div>
          {isContextFetching ? (
            <span className="text-muted-foreground shrink-0 text-xs">
              Actualisation…
            </span>
          ) : null}
        </div>
      </div>

      {loadError ? (
        <p className="text-destructive px-4 pb-3 text-sm md:px-6" role="alert">
          {toUserFacingApiError(loadError, {
            fallback: "Impossible de charger les clients.",
          })}
        </p>
      ) : null}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un client</DialogTitle>
          </DialogHeader>
          <form action={createFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nom du client</Label>
              <Input
                id="client-name"
                name="name"
                placeholder="Ex. Acme Corp"
                required
                disabled={isCreatePending}
                autoFocus
              />
            </div>
            {createState.error ? (
              <p className="text-destructive text-sm" role="alert">
                {createState.error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreatePending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isCreatePending}>
                {isCreatePending ? "Création…" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le client</DialogTitle>
            <DialogDescription>
              {selectedClient ? (
                <>
                  Cette action est irréversible. Le client{" "}
                  <span className="text-foreground font-medium">
                    {selectedClient.name}
                  </span>{" "}
                  sera supprimé.
                </>
              ) : (
                "Aucun client sélectionné."
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedClient ? (
            <form action={deleteFormAction} className="space-y-4">
              <input type="hidden" name="clientId" value={selectedClient.id} />
              {deleteState.error ? (
                <p className="text-destructive text-sm" role="alert">
                  {deleteState.error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
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
    </header>
  );
}
