"use client";

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

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: UnilizeProject | null;
}) {
  const ga4 = project?.ga4_property_id?.trim() ?? "";
  const ctr =
    project && typeof project.ctr_benchmark === "number"
      ? String(project.ctr_benchmark)
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>          
        </DialogHeader>

        {project ? (
          <div className="min-w-0 space-y-4">
            <div className="bg-muted/60 space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">
                Search Console et Google Ads
              </p>
              <p className="text-muted-foreground text-sm">
                Ces deux sources identifient les métriques du projet. Les
                changer est une opération assez lourde. Pour en choisir d&apos;autres,
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
                value={project.name}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-ga4">ID propriété GA4</Label>
              <Input
                id="edit-project-ga4"
                value={ga4}
                placeholder="Non renseigné"
                disabled
                readOnly
              />
              {ga4 ? null : (
                <p className="text-muted-foreground text-xs">
                  Aucune propriété GA4 n&apos;est associée. Elle pourra être
                  ajoutée ici.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-ctr">CTR benchmark SEA (%)</Label>
              <Input
                id="edit-project-ctr"
                value={ctr}
                disabled
                readOnly
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun projet sélectionné.</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
