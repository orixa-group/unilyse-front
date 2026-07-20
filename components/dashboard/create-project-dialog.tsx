"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { createProjectAction } from "@/app/(auth)/actions/unilize-actions";
import {
  initialCreateProjectState,
  type CreateProjectActionState,
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
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useSearchConsoleSites } from "@/hooks/use-sites-api";
import { formatGscSiteOptionLabel } from "@/lib/sites/format-gsc-site";
import { toUserFacingApiError } from "@/lib/api/error-messages";

export function CreateProjectDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onCreated: (result: CreateProjectActionState) => void;
}) {
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string | null>(null);
  const [createState, createFormAction, isCreatePending] = useActionState(
    createProjectAction,
    initialCreateProjectState,
  );

  const {
    data: sitesResult,
    isLoading: isSitesLoading,
    isError: isSitesError,
    error: sitesError,
  } = useSearchConsoleSites({ enabled: open });

  const siteOptions = useMemo(
    () =>
      (sitesResult?.sites ?? []).map((site) => ({
        value: site.url,
        label: formatGscSiteOptionLabel(site),
      })),
    [sitesResult?.sites],
  );

  useEffect(() => {
    if (!open) {
      setSelectedSiteUrl(null);
    }
  }, [open]);

  useEffect(() => {
    if (createState.success) {
      onCreated(createState);
    }
  }, [createState, onCreated]);

  const sitesLoadError = isSitesError
    ? toUserFacingApiError(sitesError?.message, {
        fallback: "Impossible de charger les sites Search Console.",
      })
    : sitesResult?.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un projet</DialogTitle>
          <DialogDescription>
            Le projet sera rattaché au client{" "}
            <span className="text-foreground font-medium">{clientName}</span>.
            Choisissez un site Google Search Console et renseignez le Customer
            ID Google Ads pour lancer la collecte SEO et SEA.
          </DialogDescription>
        </DialogHeader>
        <form action={createFormAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="url" value={selectedSiteUrl ?? ""} />
          <div className="space-y-2">
            <Label htmlFor="project-name">Nom du projet</Label>
            <Input
              id="project-name"
              name="name"
              placeholder="Ex. Site e-commerce"
              required
              disabled={isCreatePending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-customer-id">Customer ID Google Ads</Label>
            <Input
              id="project-customer-id"
              name="customer_id"
              placeholder="1234567890"
              required
              disabled={isCreatePending}
              inputMode="numeric"
              autoComplete="off"
            />
            <p className="text-muted-foreground text-xs">
              Identifiant du compte Google Ads — les métriques SEA seront
              synchronisées pour l’ensemble du compte.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-site-url">Site Search Console</Label>
            {isSitesLoading ? (
              <LoadingSkeleton className="h-9 w-full" />
            ) : (
              <Autocomplete
                id="project-site-url"
                options={siteOptions}
                value={selectedSiteUrl}
                onValueChange={setSelectedSiteUrl}
                placeholder="Sélectionner un site…"
                searchPlaceholder="Rechercher par URL ou domaine…"
                emptyMessage="Aucun site Search Console disponible."
                noResultsMessage="Aucun site ne correspond à votre recherche."
                disabled={isCreatePending || siteOptions.length === 0}
                aria-label="Site Google Search Console"
              />
            )}
            <p className="text-muted-foreground text-xs">
              Seuls les sites de votre compte Google Search Console connecté
              sont listés.
            </p>
            {isSitesError ? (
              <BffErrorAlert
                error={sitesError}
                fallback="Impossible de charger les sites Search Console."
                title="Sites Search Console indisponibles"
              />
            ) : sitesLoadError ? (
              <p className="text-destructive text-sm" role="alert">
                {sitesLoadError}
              </p>
            ) : null}
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
              onClick={() => onOpenChange(false)}
              disabled={isCreatePending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isCreatePending ||
                isSitesLoading ||
                !selectedSiteUrl ||
                Boolean(sitesLoadError)
              }
            >
              {isCreatePending ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
