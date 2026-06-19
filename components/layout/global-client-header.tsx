"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
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
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizeClient } from "@/types/unilize";

interface GlobalClientHeaderProps {
  initialClients: UnilizeClient[];
  loadError?: string | null;
}

function resolveSelectedClientId(
  clients: UnilizeClient[],
  currentId: string | null,
): string | null {
  if (!currentId) {
    return null;
  }
  return clients.some((c) => c.id === currentId) ? currentId : null;
}

export function GlobalClientHeader({
  initialClients,
  loadError = null,
}: GlobalClientHeaderProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const setSelectedClientId = useSelectionStore((s) => s.setSelectedClientId);

  const [createState, createFormAction, isCreatePending] = useActionState(
    createClientAction,
    initialCreateClientState,
  );

  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteClientAction,
    initialDeleteClientState,
  );

  const isBusy = isCreatePending || isDeletePending || isRefreshing;

  const processedCreateIdRef = useRef<string | null>(null);
  const processedDeleteIdRef = useRef<string | null>(null);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

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

    setClients((prev) => {
      if (prev.some((c) => c.id === created.id)) {
        return prev;
      }
      return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
    });
    setSelectedClientId(created.id);
    setCreateDialogOpen(false);
    startRefresh(() => {
      router.refresh();
    });
  }, [createState, router, setSelectedClientId]);

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

    setClients(remaining);
    setSelectedClientId(nextSelectedId);
    setDeleteDialogOpen(false);
    startRefresh(() => {
      router.refresh();
    });
  }, [deleteState, clients, selectedClientId, router, setSelectedClientId]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: client.name,
      })),
    [clients],
  );

  const isAutocompleteDisabled = clients.length === 0 || isBusy;
  const canDelete = Boolean(selectedClientId) && !isBusy;

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 shrink-0 border-b backdrop-blur">
      <div className="px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 md:max-w-lg">
          <Label htmlFor="client-autocomplete" className="sr-only">
            Client
          </Label>
          <Autocomplete
            id="client-autocomplete"
            className="min-w-0 flex-1"
            options={clientOptions}
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            clearable
            clearLabel="Aucun client"
            placeholder="Sélectionner un client"
            searchPlaceholder="Rechercher un client…"
            emptyMessage="Aucun client disponible"
            noResultsMessage="Aucun client trouvé"
            disabled={isAutocompleteDisabled}
            aria-label="Sélectionner un client"
          />

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCreateDialogOpen(true)}
              disabled={isBusy}
              aria-label="Créer un client"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            </Button>

            <Button
              type="button"
              variant="destructiveOutline"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!canDelete}
              aria-label="Supprimer le client sélectionné"
              title="Supprimer le client sélectionné"
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            </Button>
          </div>
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
                  et ses données associées seront supprimés.
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
