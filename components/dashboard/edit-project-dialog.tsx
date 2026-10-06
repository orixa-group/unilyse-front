"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { updateProjectAction } from "@/app/(auth)/actions/unilize-actions";
import {
  initialUpdateProjectState,
  type UpdateProjectActionState,
} from "@/app/(auth)/actions/unilize-action-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UnilizeProject } from "@/types/unilize";

function LockedValue({ label, value }: { label: string; value: string }) {
  const shown = value.trim() || "—";
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-foreground truncate text-sm" title={shown}>
        {shown}
      </p>
    </div>
  );
}

function EditProjectForm({
  project,
  clientId,
  onUpdated,
  onCancel,
}: {
  project: UnilizeProject;
  clientId: string;
  onUpdated: (result: UpdateProjectActionState) => void;
  onCancel: () => void;
}) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateProjectAction,
    initialUpdateProjectState,
  );
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!updateState.success || !updateState.project || reportedRef.current) {
      return;
    }
    reportedRef.current = true;
    onUpdated(updateState);
  }, [updateState, onUpdated]);

  return (
    <form action={updateFormAction} className="min-w-0 space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="projectId" value={project.id} />

      <div className="bg-muted/60 space-y-3 rounded-lg border p-3">
        <p className="text-sm font-medium">Search Console et Google Ads</p>
        <p className="text-muted-foreground text-sm">
          Ces deux sources identifient les métriques du projet. Les changer
          est une opération assez lourde. Pour en choisir d&apos;autres,
          supprimez ce projet puis créez-en un nouveau.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <LockedValue
            label="Propriété Search Console"
            value={project.search_console_url}
          />
          <LockedValue
            label="Compte Google Ads"
            value={project.gads_customer_id}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-name">Nom du projet</Label>
        <Input
          id="edit-project-name"
          name="name"
          defaultValue={project.name}
          required
          disabled={isUpdatePending}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-project-ga4">ID propriété GA4</Label>
        <Input
          id="edit-project-ga4"
          name="ga4_property_id"
          defaultValue={project.ga4_property_id ?? ""}
          placeholder="312345678"
          disabled={isUpdatePending}
          inputMode="numeric"
          autoComplete="off"
        />
        <p className="text-muted-foreground text-xs">
          Laisser vide retire la propriété. Un changement relance la collecte
          des performances de ce canal.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-project-ctr">CTR benchmark SEA (%)</Label>
        <Input
          id="edit-project-ctr"
          name="ctr_benchmark"
          defaultValue={
            typeof project.ctr_benchmark === "number"
              ? String(project.ctr_benchmark)
              : ""
          }
          required
          disabled={isUpdatePending}
          type="number"
          min={0.01}
          max={100}
          step="0.01"
          inputMode="decimal"
          autoComplete="off"
        />
        <p className="text-muted-foreground text-xs">
          Pourcentage strictement supérieur à 0, auquel les résultats payants
          sont comparés.
        </p>
      </div>
      {updateState.error ? (
        <p className="text-destructive text-sm" role="alert">
          {updateState.error}
        </p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUpdatePending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isUpdatePending}>
          {isUpdatePending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  clientId,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: UnilizeProject | null;
  clientId: string;
  onUpdated: (result: UpdateProjectActionState) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
        </DialogHeader>
        {project ? (
          <EditProjectForm
            key={project.id}
            project={project}
            clientId={clientId}
            onUpdated={onUpdated}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Aucun projet sélectionné.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
